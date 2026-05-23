from flask import Flask, render_template, request, send_file
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from PyPDF2 import PdfMerger
from pypdf import PdfReader, PdfWriter
import os
import json
from datetime import datetime
import uuid

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DOWNLOAD_FOLDER = os.path.join(BASE_DIR, "static", "downloads")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "generated_pdfs")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

# Premium is intentionally disabled while the app is in development.
PREMIUM_TEMPLATES = []
PREMIUM_CODE = os.environ.get("PREMIUM_CODE", "")

ALLOWED_TEMPLATES = {"classic", "modern", "professional", "minimal"}
MAX_UPLOAD_AGE_HOURS = 24

os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def cleanup_old_files(folder, max_age_hours=MAX_UPLOAD_AGE_HOURS):
    now = datetime.now().timestamp()
    max_age_seconds = max_age_hours * 60 * 60

    for filename in os.listdir(folder):
        path = os.path.join(folder, filename)

        if not os.path.isfile(path):
            continue

        if now - os.path.getmtime(path) > max_age_seconds:
            try:
                os.remove(path)
            except OSError:
                pass


def delete_file(path):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


def is_pdf_file(file):
    return file and file.filename and file.filename.lower().endswith(".pdf")


def validate_required_fields(fields):
    missing = [label for label, value in fields.items() if not value]
    if missing:
        return f"Please fill: {', '.join(missing)}."
    return None


def error_response(message, status_code=400):
    return render_template("error.html", message=message), status_code


@app.errorhandler(404)
def page_not_found(error):
    return render_template("error.html", message="This page does not exist."), 404


@app.errorhandler(413)
def file_too_large(error):
    return render_template("error.html", message="The uploaded file is too large. Please use a PDF under 20 MB."), 413


@app.errorhandler(500)
def server_error(error):
    return render_template("error.html", message="CampusKit could not finish that request. Please try again."), 500


def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return []


def save_to_history(filename):
    history = load_history()

    if filename not in history:
        history.insert(0, filename)

    history = history[:5]

    with open(HISTORY_FILE, "w", encoding="utf-8") as file:
        json.dump(history, file)

@app.route("/")
def home():
    recent_files = load_history()
    return render_template("index.html", recent_files=recent_files)

@app.route("/premium")
def premium():
    return render_template("premium_locked.html", template_name="Premium features")


@app.route("/cover-page", methods=["GET", "POST"])
def cover_page():
    if request.method == "POST":
        student_name = request.form.get("student_name", "").strip()
        roll_number = request.form.get("roll_number", "").strip()
        subject = request.form.get("subject", "").strip()
        teacher_name = request.form.get("teacher_name", "").strip()
        university = request.form.get("university", "").strip()
        department = request.form.get("department", "").strip()
        assignment_title = request.form.get("assignment_title", "").strip()
        template = request.form.get("template", "classic")

        premium_code = request.form.get("premium_code", "").strip()

        validation_error = validate_required_fields({
            "Student Name": student_name,
            "Roll Number": roll_number,
            "Subject": subject,
            "Teacher Name": teacher_name,
            "University": university,
            "Department": department,
            "Assignment Title": assignment_title,
        })

        if validation_error:
            return error_response(validation_error)

        if template not in ALLOWED_TEMPLATES:
            return error_response("Please select a valid template.")

        if template in PREMIUM_TEMPLATES and premium_code != PREMIUM_CODE:
            return render_template(
                "premium_locked.html",
                template_name=template
            )

        cleanup_old_files(DOWNLOAD_FOLDER)
        filename = f"cover_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        filepath = os.path.join(DOWNLOAD_FOLDER, filename)

        generate_cover_page(
            filepath,
            student_name,
            roll_number,
            subject,
            teacher_name,
            university,
            department,
            assignment_title,
            template
        )

        save_to_history(filename)

        return send_file(filepath, as_attachment=True, download_name=filename)

    return render_template("cover_form.html")

@app.route("/timetable", methods=["GET", "POST"])
def timetable():
    if request.method == "POST":
        student_name = request.form.get("student_name", "").strip()
        university = request.form.get("university", "").strip()
        department = request.form.get("department", "").strip()

        validation_error = validate_required_fields({
            "Student Name": student_name,
            "University": university,
            "Department / Program": department,
        })

        if validation_error:
            return error_response(validation_error)

        classes = []

        for i in range(1, 16):
            day = request.form.get(f"day_{i}", "").strip()
            start_time = request.form.get(f"start_time_{i}", "").strip()
            end_time = request.form.get(f"end_time_{i}", "").strip()
            subject = request.form.get(f"subject_{i}", "").strip()
            teacher = request.form.get(f"teacher_{i}", "").strip()
            location = request.form.get(f"location_{i}", "").strip()

            if day or start_time or end_time or subject or teacher or location:
                classes.append({
                    "day": day,
                    "time": f"{format_time(start_time)} - {format_time(end_time)}",
                    "subject": subject,
                    "teacher": teacher,
                    "location": location
                })

        if not classes:
            return error_response("Please enter at least one class.")

        cleanup_old_files(DOWNLOAD_FOLDER)
        filename = f"timetable_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(DOWNLOAD_FOLDER, filename)

        generate_timetable_pdf(
            filepath,
            student_name,
            university,
            department,
            classes
        )

        save_to_history(filename)

        return send_file(filepath, as_attachment=True, download_name=filename)

    return render_template("timetable.html")


@app.route("/merge-pdf", methods=["GET", "POST"])
def merge_pdf():
    if request.method == "POST":
        files = request.files.getlist("pdf_files")

        if not files or files[0].filename == "":
            return error_response("Please upload at least one PDF file.")

        merger = PdfMerger()
        uploaded_paths = []

        try:
            for file in files:
                if not is_pdf_file(file):
                    continue

                temp_path = os.path.join(
                    UPLOAD_FOLDER,
                    f"{uuid.uuid4().hex}_{os.path.basename(file.filename)}"
                )
                file.save(temp_path)
                uploaded_paths.append(temp_path)
                merger.append(temp_path)

            if not uploaded_paths:
                return error_response("Please upload valid PDF files only.")

            cleanup_old_files(DOWNLOAD_FOLDER)
            cleanup_old_files(UPLOAD_FOLDER)

            output_filename = f"merged_{uuid.uuid4().hex[:8]}.pdf"
            output_path = os.path.join(DOWNLOAD_FOLDER, output_filename)

            merger.write(output_path)
            save_to_history(output_filename)

            return send_file(output_path, as_attachment=True, download_name=output_filename)
        finally:
            merger.close()
            for path in uploaded_paths:
                delete_file(path)

    return render_template("merge_pdf.html")


@app.route("/compress-pdf", methods=["GET", "POST"])
def compress_pdf():
    if request.method == "POST":
        file = request.files.get("pdf_file")

        if not is_pdf_file(file):
            return error_response("Please upload a valid PDF file.")

        input_path = os.path.join(
            UPLOAD_FOLDER,
            f"{uuid.uuid4().hex}_{os.path.basename(file.filename)}"
        )
        file.save(input_path)

        try:
            original_size = os.path.getsize(input_path)

            reader = PdfReader(input_path)
            writer = PdfWriter()

            for page in reader.pages:
                writer.add_page(page)

            for page in writer.pages:
                page.compress_content_streams()

            cleanup_old_files(DOWNLOAD_FOLDER)
            cleanup_old_files(UPLOAD_FOLDER)

            output_filename = f"compressed_{uuid.uuid4().hex[:8]}.pdf"
            output_path = os.path.join(DOWNLOAD_FOLDER, output_filename)

            with open(output_path, "wb") as output_file:
                writer.write(output_file)

            compressed_size = os.path.getsize(output_path)

            saved_percent = round(
                ((original_size - compressed_size) / original_size) * 100,
                1
            )

            save_to_history(output_filename)

            return render_template(
                "compress_success.html",
                filename=output_filename,
                original_size=round(original_size / (1024 * 1024), 2),
                compressed_size=round(compressed_size / (1024 * 1024), 2),
                saved_percent=saved_percent
            )
        finally:
            delete_file(input_path)
    return render_template("compress_pdf.html")


def generate_cover_page(filepath, student_name, roll_number, subject, teacher_name,
                        university, department, assignment_title, template):
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    if template == "modern":
        draw_modern_template(c, width, height, student_name, roll_number, subject,
                             teacher_name, university, department, assignment_title)

    elif template == "professional":
        draw_professional_template(c, width, height, student_name, roll_number, subject,
                                   teacher_name, university, department, assignment_title)

    elif template == "minimal":
        draw_minimal_template(c, width, height, student_name, roll_number, subject,
                              teacher_name, university, department, assignment_title)
    else:
        draw_classic_template(c, width, height, student_name, roll_number, subject,
                              teacher_name, university, department, assignment_title)

    c.save()

def generate_timetable_pdf(filepath, student_name, university, department, classes):
    c = canvas.Canvas(filepath, pagesize=landscape(A4))
    width, height = landscape(A4)

    navy = colors.HexColor("#1E3A8A")
    light_blue = colors.HexColor("#DBEAFE")
    text_dark = colors.HexColor("#111827")
    grey = colors.HexColor("#475569")
    line = colors.HexColor("#CBD5E1")
    page_bg = colors.HexColor("#F8FAFC")

    c.setFillColor(page_bg)
    c.rect(0, 0, width, height, fill=True, stroke=False)

    margin = 35
    c.setStrokeColor(navy)
    c.setLineWidth(2)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin)

    y = height - 70

    c.setFillColor(navy)
    uni_size = fit_text(c, university.upper(), width - 120, "Helvetica-Bold", 22)
    c.setFont("Helvetica-Bold", uni_size)
    c.drawCentredString(width / 2, y, university.upper())

    y -= 28
    c.setFillColor(grey)
    dept_size = fit_text(c, department, width - 140, "Helvetica", 13)
    c.setFont("Helvetica", dept_size)
    c.drawCentredString(width / 2, y, department)

    y -= 38
    c.setFillColor(light_blue)
    c.roundRect(width / 2 - 170, y - 25, 340, 45, 14, fill=True, stroke=False)

    c.setFillColor(text_dark)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, y - 9, "WEEKLY CLASS TIMETABLE")

    c.setFillColor(grey)
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, y - 55, f"Student: {safe_text(student_name, '-')}")

    table_x = 65
    table_y = height - 245
    row_h = 26

    col_widths = [90, 110, 180, 160, 155]
    headers = ["Day", "Time", "Subject", "Teacher", "Location"]

    c.setFillColor(navy)
    c.roundRect(table_x, table_y, sum(col_widths), row_h, 8, fill=True, stroke=False)

    x = table_x
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)

    for i, header in enumerate(headers):
        c.drawCentredString(x + col_widths[i] / 2, table_y + 14, header)
        x += col_widths[i]

    current_y = table_y - row_h

    for index, item in enumerate(classes[:15]):
        c.setFillColor(colors.white if index % 2 == 0 else colors.HexColor("#F1F5F9"))
        c.rect(table_x, current_y, sum(col_widths), row_h, fill=True, stroke=False)

        values = [
            item["day"],
            item["time"],
            item["subject"],
            item["teacher"],
            item["location"]
        ]

        x = table_x

        for i, value in enumerate(values):
            c.setFillColor(text_dark)
            value_size = fit_text(c, safe_text(value, "-"), col_widths[i] - 14, "Helvetica", 9)
            c.setFont("Helvetica", value_size)
            c.drawCentredString(x + col_widths[i] / 2, current_y + 9, safe_text(value, "-"))

            c.setStrokeColor(line)
            c.setLineWidth(0.5)
            c.line(x, current_y, x, current_y + row_h)

            x += col_widths[i]

        c.setStrokeColor(line)
        c.line(table_x, current_y, table_x + sum(col_widths), current_y)

        current_y -= row_h

    c.save()


def safe_text(value, fallback=""):
    return value if value else fallback


def fit_text(c, text, max_width, font_name, font_size):
    text = safe_text(text)
    while c.stringWidth(text, font_name, font_size) > max_width and font_size > 8:
        font_size -= 1
    return font_size


def format_time(time_str):
    try:
        return datetime.strptime(time_str, "%H:%M").strftime("%I:%M %p")
    except ValueError:
        return time_str


def draw_detail_rows(c, x, y, rows, label_color, value_color, line_color=None):
    for label, value in rows:
        c.setFillColor(label_color)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x, y, label.upper())

        c.setFillColor(value_color)
        c.setFont("Helvetica", 13)
        c.drawString(x + 135, y, safe_text(value, "-"))

        if line_color:
            c.setStrokeColor(line_color)
            c.setLineWidth(0.5)
            c.line(x, y - 12, x + 360, y - 12)

        y -= 36


def draw_footer(c, width):
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.drawCentredString(width / 2, 28, "Generated by CampusKit")


def draw_classic_template(c, width, height, student_name, roll_number, subject,
                          teacher_name, university, department, assignment_title,
                          submission_date=None):

    from reportlab.lib import colors
    from datetime import date

    if submission_date is None:
        submission_date = date.today().strftime("%Y-%m-%d")

    navy = colors.HexColor("#111827")
    light_blue = colors.HexColor("#F3F4F6")
    text_dark = colors.HexColor("#111827")
    grey = colors.HexColor("#4B5563")
    line = colors.HexColor("#D1D5DB")
    page_bg = colors.white

    c.setFillColor(page_bg)
    c.rect(0, 0, width, height, fill=True, stroke=False)

    margin = 38
    c.setStrokeColor(navy)
    c.setLineWidth(2)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin)

    c.setStrokeColor(line)
    c.setLineWidth(1)
    c.rect(margin + 13, margin + 13, width - 2 * (margin + 13), height - 2 * (margin + 13))

    y = height - 95
    c.setFillColor(navy)
    uni_size = fit_text(c, university.upper(), width - 120, "Helvetica-Bold", 23)
    c.setFont("Helvetica-Bold", uni_size)
    c.drawCentredString(width / 2, y, university.upper())

    y -= 32
    c.setFillColor(grey)
    dept_size = fit_text(c, department, width - 130, "Helvetica", 14)
    c.setFont("Helvetica", dept_size)
    c.drawCentredString(width / 2, y, department)

    y -= 25
    c.setStrokeColor(line)
    c.setLineWidth(1.2)
    c.line(width / 2 - 160, y, width / 2 + 160, y)

    box_w = width - 150
    box_h = 95
    box_x = 75
    box_y = height - 280

    c.setFillColor(light_blue)
    c.roundRect(box_x, box_y, box_w, box_h, 8, fill=True, stroke=False)

    c.setFillColor(text_dark)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, box_y + 55, "ASSIGNMENT")

    title_size = fit_text(c, assignment_title, box_w - 40, "Helvetica-Bold", 16)
    c.setFont("Helvetica-Bold", title_size)
    c.drawCentredString(width / 2, box_y + 27, assignment_title)

    card_x = 80
    card_y = 205
    card_w = width - 160
    card_h = 275

    c.setFillColor(colors.white)
    c.setStrokeColor(line)
    c.setLineWidth(1)
    c.roundRect(card_x, card_y, card_w, card_h, 8, fill=True, stroke=True)

    labels = ["Student Name", "Roll Number", "Subject", "Submitted To", "Submission Date"]
    values = [student_name, roll_number, subject, teacher_name, submission_date]

    start_y = card_y + card_h - 50
    row_gap = 43
    label_x = card_x + 35
    value_x = card_x + 180

    for i, (label, value) in enumerate(zip(labels, values)):
        row_y = start_y - i * row_gap

        c.setFillColor(navy)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(label_x, row_y, label)

        c.setFillColor(text_dark)
        value_size = fit_text(c, str(value), card_w - 230, "Helvetica", 12)
        c.setFont("Helvetica", value_size)
        c.drawString(value_x, row_y, str(value))

        c.setStrokeColor(line)
        c.line(label_x, row_y - 12, card_x + card_w - 35, row_y - 12)

    c.setFillColor(grey)
    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(width / 2, 75, "Generated by CampusKit")


def draw_modern_template(c, width, height, student_name, roll_number, subject,
                         teacher_name, university, department, assignment_title,
                         submission_date=None):

    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from datetime import date

    if submission_date is None:
        submission_date = date.today().strftime("%Y-%m-%d")

    navy = colors.HexColor("#1E3A8A")
    light_blue = colors.HexColor("#DBEAFE")
    text_dark = colors.HexColor("#111827")
    grey = colors.HexColor("#475569")
    line = colors.HexColor("#E2E8F0")
    page_bg = colors.HexColor("#F8FAFC")

    # Background
    c.setFillColor(page_bg)
    c.rect(0, 0, width, height, fill=True, stroke=False)

    # Outer border
    margin = 35
    c.setStrokeColor(navy)
    c.setLineWidth(3)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin)

    # Inner light border
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(1)
    c.rect(margin + 15, margin + 15, width - 2 * (margin + 15), height - 2 * (margin + 15))

    # University title
    y = height - 95
    c.setFillColor(navy)
    c.setFont("Helvetica-Bold", 25)
    c.drawCentredString(width / 2, y, university.upper())

    # Department
    y -= 32
    c.setFillColor(grey)
    c.setFont("Helvetica", 15)
    c.drawCentredString(width / 2, y, department)

    # Blue separator line
    y -= 25
    c.setStrokeColor(navy)
    c.setLineWidth(1.5)
    c.line(width / 2 - 165, y, width / 2 + 165, y)

    # Assignment title box
    box_w = width - 150
    box_h = 95
    box_x = 75
    box_y = height - 280

    c.setFillColor(light_blue)
    c.roundRect(box_x, box_y, box_w, box_h, 18, fill=True, stroke=False)

    c.setFillColor(text_dark)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, box_y + 55, "ASSIGNMENT")

    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, box_y + 27, assignment_title)

    # Details card
    card_x = 80
    card_y = 205
    card_w = width - 160
    card_h = 275

    c.setFillColor(colors.white)
    c.setStrokeColor(line)
    c.setLineWidth(1)
    c.roundRect(card_x, card_y, card_w, card_h, 14, fill=True, stroke=True)

    labels = [
        "Student Name",
        "Roll Number",
        "Subject",
        "Submitted To",
        "Submission Date"
    ]

    values = [
        student_name,
        roll_number,
        subject,
        teacher_name,
        submission_date
    ]

    start_y = card_y + card_h - 50
    row_gap = 43
    label_x = card_x + 35
    value_x = card_x + 180

    for i, (label, value) in enumerate(zip(labels, values)):
        row_y = start_y - i * row_gap

        c.setFillColor(navy)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(label_x, row_y, label)

        c.setFillColor(text_dark)
        c.setFont("Helvetica", 12)
        c.drawString(value_x, row_y, str(value))

        c.setStrokeColor(line)
        c.setLineWidth(1)
        c.line(label_x, row_y - 12, card_x + card_w - 35, row_y - 12)

    # Footer
    c.setFillColor(colors.HexColor("#64748B"))
    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(width / 2, 75, "Generated by Campus Kit")

def draw_minimal_template(c, width, height, student_name, roll_number, subject,
                          teacher_name, university, department, assignment_title,
                          submission_date=None):

    from reportlab.lib import colors
    from datetime import date

    if submission_date is None:
        submission_date = date.today().strftime("%Y-%m-%d")

    black = colors.HexColor("#18181B")
    text_dark = colors.HexColor("#18181B")
    grey = colors.HexColor("#71717A")
    line = colors.HexColor("#E4E4E7")
    page_bg = colors.white
    soft_box = colors.HexColor("#FAFAFA")

    c.setFillColor(page_bg)
    c.rect(0, 0, width, height, fill=True, stroke=False)

    margin = 45
    c.setStrokeColor(line)
    c.setLineWidth(1.2)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin)

    y = height - 105
    c.setFillColor(black)
    uni_size = fit_text(c, university.upper(), width - 130, "Helvetica-Bold", 22)
    c.setFont("Helvetica-Bold", uni_size)
    c.drawCentredString(width / 2, y, university.upper())

    y -= 30
    c.setFillColor(grey)
    dept_size = fit_text(c, department, width - 140, "Helvetica", 13)
    c.setFont("Helvetica", dept_size)
    c.drawCentredString(width / 2, y, department)

    y -= 28
    c.setStrokeColor(line)
    c.setLineWidth(1)
    c.line(width / 2 - 130, y, width / 2 + 130, y)

    box_w = width - 170
    box_h = 90
    box_x = 85
    box_y = height - 280

    c.setFillColor(soft_box)
    c.roundRect(box_x, box_y, box_w, box_h, 6, fill=True, stroke=False)

    c.setFillColor(black)
    c.setFont("Helvetica-Bold", 27)
    c.drawCentredString(width / 2, box_y + 54, "ASSIGNMENT")

    title_size = fit_text(c, assignment_title, box_w - 40, "Helvetica", 16)
    c.setFont("Helvetica", title_size)
    c.drawCentredString(width / 2, box_y + 28, assignment_title)

    card_x = 90
    card_y = 210
    card_w = width - 180
    card_h = 265

    c.setFillColor(colors.white)
    c.setStrokeColor(line)
    c.setLineWidth(1)
    c.roundRect(card_x, card_y, card_w, card_h, 6, fill=True, stroke=True)

    labels = ["Student Name", "Roll Number", "Subject", "Submitted To", "Submission Date"]
    values = [student_name, roll_number, subject, teacher_name, submission_date]

    start_y = card_y + card_h - 48
    row_gap = 41
    label_x = card_x + 32
    value_x = card_x + 175

    for i, (label, value) in enumerate(zip(labels, values)):
        row_y = start_y - i * row_gap

        c.setFillColor(grey)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(label_x, row_y, label)

        c.setFillColor(text_dark)
        value_size = fit_text(c, str(value), card_w - 225, "Helvetica", 11)
        c.setFont("Helvetica", value_size)
        c.drawString(value_x, row_y, str(value))

        c.setStrokeColor(line)
        c.line(label_x, row_y - 12, card_x + card_w - 32, row_y - 12)

    c.setFillColor(grey)
    c.setFont("Helvetica", 8)
    c.drawCentredString(width / 2, 75, "CampusKit")

def draw_professional_template(c, width, height, student_name, roll_number,
                               subject, teacher_name, university,
                               department, assignment_title):

    navy = colors.HexColor("#0F172A")
    slate = colors.HexColor("#475569")
    light = colors.HexColor("#E2E8F0")
    soft = colors.HexColor("#F8FAFC")

    c.setFillColor(colors.white)
    c.rect(0, 0, width, height, fill=True, stroke=False)

    # Header
    c.setFillColor(navy)
    c.rect(45, height - 145, width - 90, 100, fill=True, stroke=False)

    c.setFillColor(colors.white)
    uni_size = fit_text(c, university.upper(), width - 130, "Helvetica-Bold", 20)
    c.setFont("Helvetica-Bold", uni_size)
    c.drawCentredString(width / 2, height - 85, university.upper())

    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 110, department)

    # Assignment label
    c.setFillColor(slate)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(width / 2, height - 215, "ASSIGNMENT")

    # Assignment title
    c.setFillColor(navy)
    title_size = fit_text(c, assignment_title, width - 140, "Helvetica-Bold", 28)
    c.setFont("Helvetica-Bold", title_size)
    c.drawCentredString(width / 2, height - 255, assignment_title)

    # Subtle divider
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(2)
    c.line(width / 2 - 55, height - 280, width / 2 + 55, height - 280)

    # Details card
    card_x = 85
    card_y = height - 570
    card_w = width - 170
    card_h = 230

    c.setFillColor(soft)
    c.roundRect(card_x, card_y, card_w, card_h, 14, fill=True, stroke=False)

    c.setStrokeColor(light)
    c.roundRect(card_x, card_y, card_w, card_h, 14, fill=False, stroke=True)

    rows = [
        ("Student Name", student_name),
        ("Roll Number", roll_number),
        ("Subject", subject),
        ("Submitted To", teacher_name),
        ("Submission Date", datetime.now().strftime("%Y-%m-%d")),
    ]

    y = card_y + card_h - 42

    for label, value in rows:
        c.setFillColor(slate)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(card_x + 35, y, label.upper())

        c.setFillColor(navy)
        c.setFont("Helvetica", 13)
        c.drawString(card_x + 175, y, safe_text(value, "-"))

        c.setStrokeColor(light)
        c.line(card_x + 35, y - 14, card_x + card_w - 35, y - 14)

        y -= 38


if __name__ == "__main__":
    app.run(debug=True)

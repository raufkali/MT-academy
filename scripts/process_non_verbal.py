import os
import json
import csv
import re
from PIL import Image, ImageDraw, ImageFont, ImageOps

NTSE_BASE = r"C:\Users\Rufi Boy\Desktop\New folder (7)\New folder\NTSEBench\Data\public"
DATA_JSON_PATH = os.path.join(NTSE_BASE, "data_public.json")
OUTPUT_IMG_DIR = r"D:\mock-test\public\question-images\non-verbal"
OUTPUT_JSON_PATH = r"D:\mock-test\non_verbal_questions_ready.json"
OUTPUT_CSV_PATH = r"D:\mock-test\non_verbal_questions_ready.csv"

os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)

# Category mapping to PMA topics
CAT_NAMES = {
    10: ("Venn Diagrams", "Visual Logic"),
    12: ("Missing Character Matrix", "Pattern Recognition"),
    13: ("Non-Verbal Series", "Series Completion"),
    14: ("Non-Verbal Odd One Out", "Classification"),
    15: ("Non-Verbal Analogy", "Analogy Figures"),
    16: ("Incomplete Figure", "Pattern Completion"),
    17: ("Mirror, Water and Images", "Spatial Visualization"),
    18: ("Cube and Dice", "Spatial Reasoning"),
    19: ("Paper Folding & Cutting", "Spatial Reasoning"),
    20: ("Embedded Figure", "Pattern Recognition"),
    22: ("Figure Partition & Counting", "Geometric Counting"),
    23: ("Dot Problem", "Logical Association"),
}

# Load Fonts
FONT_PATH = r"C:\Windows\Fonts\arial.ttf"
FONT_BOLD_PATH = r"C:\Windows\Fonts\arialbd.ttf"
if not os.path.exists(FONT_BOLD_PATH):
    FONT_BOLD_PATH = FONT_PATH

FONT_HEADER = ImageFont.truetype(FONT_BOLD_PATH, 13) if os.path.exists(FONT_BOLD_PATH) else ImageFont.load_default()
FONT_LABEL = ImageFont.truetype(FONT_BOLD_PATH, 15) if os.path.exists(FONT_BOLD_PATH) else ImageFont.load_default()
FONT_TEXT = ImageFont.truetype(FONT_PATH, 12) if os.path.exists(FONT_PATH) else ImageFont.load_default()

def clean_text(dirn, prompt, cat_subject):
    dirn = dirn or ""
    prompt = prompt or ""
    
    combined = (dirn + " " + prompt).strip()
    
    # 1. Remove LaTeX symbols
    combined = re.sub(r"\\mathbf\{([^}]*)\}", r"\1", combined)
    combined = re.sub(r"\\mathrm\{([^}]*)\}", r"\1", combined)
    combined = re.sub(r"\\text\{([^}]*)\}", r"\1", combined)
    combined = re.sub(r"\\frac\{([^}]*)\}\{([^}]*)\}", r"\1/\2", combined)
    combined = combined.replace(r"{90}^\circ", "90°")
    combined = re.sub(r"\$\s*\\?\s*\{?\\?\s*\}?\s*\$", "", combined)
    combined = re.sub(r"\$", "", combined)
    
    # 2. Fix OCR artifacts and typos
    combined = re.sub(r"(?i)\bquestic\s*n\b", "question", combined)
    combined = re.sub(r"(?i)\bHee are\b", "Here are", combined)
    combined = re.sub(r"(?i)\bThesre\b", "There", combined)
    combined = re.sub(r"(?i)\btie same\b", "the same", combined)
    combined = re.sub(r"(?i)\bnumbers are lace in figure\b", "numbers are placed in the figure", combined)
    combined = re.sub(r"(?i)\bOne place in vacant\b", "One place is vacant", combined)
    combined = re.sub(r"(?i)\bcoorect\b", "correct", combined)
    combined = re.sub(r"(?i)\bHospita\b", "Hospital", combined)
    combined = re.sub(r"(?i)\bthe the in the figure\b", "there in the figure", combined)
    combined = re.sub(r"(?i)\bParralelograms\b", "parallelograms", combined)
    combined = re.sub(r"(?i)\bwater-\s*image\b", "water image", combined)
    combined = re.sub(r"(?i)\bmirror images\b", "mirror image", combined)
    combined = re.sub(r"(?i)\bdirn\.", "direction", combined)
    combined = re.sub(r"(?i)\bwhich is different them the rext\b", "which is different from the rest.", combined)

    # 3. Direct question mappings for raw recurring instructions
    if re.search(r"(?i)if two figures among five figures are interchanged", combined):
        return "If two of the figures are interchanged, they will form a logical order. Find which two figures should be interchanged:"

    if (re.search(r"(?i)Out of the four figures.*three are similar.*One figure is not like", combined) or
        re.search(r"(?i)three are similar in a certain way.*Choose the figure which is different", combined) or
        re.search(r"(?i)Three terms \(figure\) are alike.*One term \(figure\) is different", combined) or
        re.search(r"(?i)choose the figure which is different", combined) or
        re.search(r"(?i)does not correlate with the rest of the figures.*Select that odd", combined) or
        re.search(r"(?i)\bFind the odd figure\b", combined)):
        return "Select the figure from the given alternatives which is different from the rest:"

    if (re.search(r"(?i)The diagram and numbers/letters follow certain principle.*Select the missing number/letter", combined) or
        re.search(r"(?i)In this type of Question, a figure or a matrix is given in which some numbers are filled according to a rule", combined) or
        re.search(r"(?i)numbers are placed in the figure on the basis of some rules.*One place is vacant.*replace", combined) or
        re.search(r"(?i)numbers are arranged on the basis of some rules.*One place is vacant.*replace the question mark", combined) or
        re.search(r"(?i)numbers are written with a specific rule.*decide which alternative will be", combined)):
        return "Find out which number or letter replaces the question mark (?) according to the pattern:"

    if re.search(r"(?i)There is a certain relationship between the numbers that are given in the following figure.*replace the question mark", combined):
        return "Find the number that replaces the question mark (?) according to the pattern:"

    if (re.search(r"(?i)Each of the following questions consists of two sets of figures.*definite relationship between figures A and B.*establish a similar relationship between figures C and D", combined) or
        re.search(r"(?i)Figures A and B are related in some manner.*Find the same relationship between figures C and D", combined) or
        re.search(r"(?i)figure A and B are related in some Particular Manner.*Replace question mark for figure D.*same relationship between C and D", combined) or
        re.search(r"(?i)specific relationship between the first and second figure.*same relationship exists between the third and fourth", combined) or
        re.search(r"(?i)there are three problem figures followed by a question mark\(\?\) for the fourth one.*relationship between the first two", combined) or
        re.search(r"(?i)terms left to the symbol :: is the same between the terms right to the symbol ::", combined)):
        return "Find the figure which bears the same relationship to the third figure as the second figure bears to the first:"

    if (re.search(r"(?i)Each of the following questions consists of the five figures.*Select a figure which will continue the same series", combined) or
        re.search(r"(?i)Each of the following questions consists of five figures.*Select a figure which will continue the same series", combined) or
        re.search(r"(?i)There is a sequence according to which the problem figures are arranged.*select an answer figure which can be added in sequence", combined) or
        re.search(r"(?i)which figure among Alternatives, will replace the question mark according to series", combined) or
        re.search(r"(?i)the s change in a particular order.*replace the question mark", combined) or
        re.search(r"(?i)Choose next figure in sequence", combined)):
        return "Identify the figure from the given alternatives that replaces the question mark (?) and continues the series:"

    if (re.search(r"(?i)Each of the following questions consists of a set of three figures X,Y and Z showing a Sequence of folding", combined) or
        re.search(r"(?i)Paper is folded as shown with the dotted lines in ' X ' & ' Y ' and the last figure 'Z' has been cut.*How would the paper look like when unfolded", combined) or
        re.search(r"(?i)A square shaped paper is folded as shown in the figure.*when unfolded will look like", combined) or
        re.search(r"(?i)A square piece of paper is folded and cut at specific spots.*when unfolded will look-like", combined) or
        re.search(r"(?i)square transparent sheet with a pattern is folded along the dotted line.*Which of the following answer figures is formed", combined) or
        re.search(r"(?i)transparent square shaped paper is folded along the dotted lines, which figure will be obtained", combined)):
        return "Find the figure that shows how the sheet will appear when unfolded along the crease lines:"

    if re.search(r"(?i)rotate the figure by 90°.*clockwise.*find out the water image", combined):
        return "Rotate the figure by 90° clockwise, then identify its correct water reflection:"

    if (re.search(r"(?i)choose the correct mirror image.*when mirror is placed on right", combined) or
        re.search(r"(?i)find the correct mirror image of the given figure, when mirror is placed on right", combined) or
        re.search(r"(?i)choose the mirror image from the alternatives", combined) or
        re.search(r"(?i)Choose the mirror from the alternatives", combined)):
        word_match = re.search(r"\b([A-Z]{3,}|\d{4,})\s*$", combined)
        if word_match:
            return f"Find the correct mirror image of '{word_match.group(1)}' when the mirror is placed on the right:"
        return "Find the correct mirror image of the given figure when the mirror is placed on the right:"

    if (re.search(r"(?i)The reflection of an object as seen in water is called its water image.*Find the water image", combined) or
        re.search(r"(?i)find the correct water image of the given figure", combined)):
        word_match = re.search(r"\b([A-Z]{3,}|[A-Za-z]{4,}|\d{4,})\s*$", combined)
        if word_match:
            return f"Find the correct water reflection (water image) of '{word_match.group(1)}':"
        return "Find the correct water reflection (water image) of the given figure:"

    if re.search(r"(?i)Five diagrams A,B,C,D,E are given.*Three out of these when put together make a square", combined):
        return "Three of the five diagrams (A, B, C, D, E) when put together form a complete square. Find the set of three diagrams from the alternatives:"

    if re.search(r"(?i)select the alternative which satisfy tie same condition of placement of dots|satisfies the identical condition of placement of dots", combined):
        return "Select the option figure that satisfies the identical condition of placement of dots as in the problem figure:"

    if (re.search(r"(?i)embedded in one of the answer figures.*Trace out that correct figure", combined) or
        re.search(r"(?i)is embedded in one of the Answer figure.*Find the alternative in which it is embedded", combined) or
        re.search(r"(?i)simple figures given in the alternatives is hidden in the complex figure", combined)):
        return "Identify the option figure in which the given problem figure is hidden or embedded:"

    if (re.search(r"(?i)Which of the answer-?figures will complete the matrix", combined) or
        re.search(r"(?i)Find missing part of figure", combined) or
        re.search(r"(?i)complete the given matrix figure", combined) or
        re.search(r"(?i)Select the correct alternatives which can complete the figures", combined) or
        re.search(r"(?i)find the correct alternative from the Answer figures to complete the", combined)):
        return "Select the figure from the options that correctly completes the missing part of the pattern:"

    # 4. Remove Direction and Question number prefixes
    combined = re.sub(r"(?i)^(?:directions?\s*[:–—\-]?\s*)?(?:in\s+)?(?:questions?|questic\s*n)?\s*(?:nos?\.?|numbers?)?\s*\(?[\d\s,toand–—\-]+\)?\s*[:–—\-]?\s*", "", combined)
    combined = re.sub(r"(?i)^\(?[\d\s,toand–—\-]+\)?\s*[:–—\-]\s*", "", combined)
    combined = re.sub(r"(?i)^instruction[s]?\s*[:–—\-]?\s*(?:in\s+question\s+numbers?\s*[\d\s,toand–—\-]+)?\s*[,:]?\s*", "", combined)
    combined = re.sub(r"(?i)^questions?\s+image\s*", "", combined)
    combined = re.sub(r"(?i)^questions?\s+figure\s*", "", combined)
    combined = re.sub(r"^:\s*", "", combined)

    # 5. Remove trailing suffixes
    combined = re.sub(r"(?i)\s*(?:problem|answer)\s+figures?[:.]?", "", combined)
    combined = re.sub(r"(?i)\s*question-image\s+answer-image", "", combined)
    combined = re.sub(r"(?i)\s*answer\s+image", "", combined)
    combined = re.sub(r"(?i)\s*transparent\s+sheet", "", combined)
    combined = re.sub(r"(?i)\s*:\s*answer\s+figures?\s*:", "", combined)
    combined = re.sub(r"\s*:\s*$", "", combined)
    combined = re.sub(r"(?i)\s+\.?\s*s$", "", combined)
    combined = re.sub(r"(?i)\s+I\s+II$", "", combined)
    combined = re.sub(r"\s+", " ", combined).strip()

    # 6. Fix Venn Diagram queries
    combined = re.sub(r"(?i)relation(?:ship)? between (?:given three items )?([^?]+)\??", r"relationship between \1?", combined)
    combined = re.sub(r"(?i)represents? ([^?]+)\s*\??", r"represents \1?", combined)

    # 7. Clean analytical reasoning prefix
    combined = re.sub(r"(?i)^These Questions are based on analytical reasoning\.\s*", "", combined)
    if re.match(r"(?i)^The number of triangles in the figure", combined):
        combined = "Find the number of triangles in the given figure:"

    # 8. Clean leading lowercase
    if combined and combined[0].islower():
        combined = combined[0].upper() + combined[1:]

    # 9. Punctuation
    if combined and not re.search(r"[.?:!]$", combined):
        if re.match(r"(?i)^(which|what|how|who|where)", combined):
            combined += "?"
        elif re.match(r"(?i)^(determine|find|select|choose|identify)", combined):
            combined += ":"
        else:
            combined += "."

    return combined

def trim_image(img):
    """Trim excess pure white or transparent margins around a figure"""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    
    # Find bounding box of non-white content
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    diff = ImageOps.invert(img.convert("RGB"))
    bbox = diff.getbbox()
    if bbox:
        # Add a 6px margin
        x0 = max(0, bbox[0] - 6)
        y0 = max(0, bbox[1] - 6)
        x1 = min(img.width, bbox[2] + 6)
        y1 = min(img.height, bbox[3] + 6)
        if x1 > x0 and y1 > y0:
            return img.crop((x0, y0, x1, y1))
    return img

def create_composite_both(prob_path, opt_paths, out_path):
    """
    Composite Problem Image (top) and 4 Option Images (bottom)
    Canvas width: 680px
    """
    prob_img = trim_image(Image.open(prob_path))
    opt_imgs = [trim_image(Image.open(p)) for p in opt_paths]
    
    canvas_w = 680
    pad = 16
    
    # Scale problem image if too tall
    pw, ph = prob_img.size
    max_ph = 180
    max_pw = canvas_w - pad * 2
    scale_p = min(max_pw / pw, max_ph / ph, 1.0)
    pw, ph = int(pw * scale_p), int(ph * scale_p)
    prob_resized = prob_img.resize((pw, ph), Image.Resampling.LANCZOS)
    
    # Scale option images into 4 boxes
    # Total available width for 4 boxes = canvas_w - (5 * pad)
    box_w = int((canvas_w - 5 * pad) / 4)
    box_h = 120
    
    opt_resized = []
    for oi in opt_imgs:
        ow, oh = oi.size
        scale_o = min((box_w - 14) / ow, (box_h - 36) / oh, 1.0)
        nw, nh = max(1, int(ow * scale_o)), max(1, int(oh * scale_o))
        opt_resized.append(oi.resize((nw, nh), Image.Resampling.LANCZOS))
        
    top_section_h = ph + 42
    bottom_section_h = box_h + 38
    total_h = top_section_h + bottom_section_h + pad * 2
    
    canvas = Image.new("RGB", (canvas_w, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Outer light card border
    draw.rounded_rectangle([2, 2, canvas_w - 3, total_h - 3], radius=6, outline=(226, 232, 240), width=1)
    
    # Header 1: Problem Figure
    draw.text((pad, 10), "PROBLEM FIGURE", fill=(15, 59, 93), font=FONT_HEADER)
    # Paste problem image centered
    px = (canvas_w - pw) // 2
    py = 34
    # Background card for problem figure
    draw.rounded_rectangle([px - 8, py - 4, px + pw + 8, py + ph + 4], radius=4, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    canvas.paste(prob_resized, (px, py), prob_resized)
    
    # Divider line
    div_y = top_section_h + 6
    draw.line([(pad, div_y), (canvas_w - pad, div_y)], fill=(226, 232, 240), width=1)
    
    # Header 2: Answer Choices
    draw.text((pad, div_y + 8), "ANSWER CHOICES", fill=(15, 59, 93), font=FONT_HEADER)
    
    # 4 Option Cards
    labels = ["(A)", "(B)", "(C)", "(D)"]
    for i, (oi, lbl) in enumerate(zip(opt_resized, labels)):
        bx = pad + i * (box_w + pad)
        by = div_y + 28
        
        # Draw card box
        draw.rounded_rectangle([bx, by, bx + box_w, by + box_h], radius=4, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
        # Draw top label bar
        draw.rounded_rectangle([bx, by, bx + box_w, by + 24], radius=4, fill=(241, 245, 249))
        draw.rectangle([bx, by + 20, bx + box_w, by + 24], fill=(241, 245, 249)) # flatten bottom corners
        draw.text((bx + (box_w - 20) // 2, by + 4), lbl, fill=(15, 59, 93), font=FONT_LABEL)
        
        # Paste option image centered
        ow, oh = oi.size
        ox = bx + (box_w - ow) // 2
        oy = by + 26 + (box_h - 28 - oh) // 2
        canvas.paste(oi, (ox, oy), oi)
        
    canvas.save(out_path, "WEBP", quality=82, method=6)

def create_composite_options_only(opt_paths, out_path):
    """
    Composite 4 Option Images side-by-side (Odd one out, Venn Diagrams)
    Canvas width: 680px
    """
    opt_imgs = [trim_image(Image.open(p)) for p in opt_paths]
    canvas_w = 680
    pad = 16
    
    box_w = int((canvas_w - 5 * pad) / 4)
    box_h = 135
    
    opt_resized = []
    for oi in opt_imgs:
        ow, oh = oi.size
        scale_o = min((box_w - 14) / ow, (box_h - 38) / oh, 1.0)
        nw, nh = max(1, int(ow * scale_o)), max(1, int(oh * scale_o))
        opt_resized.append(oi.resize((nw, nh), Image.Resampling.LANCZOS))
        
    total_h = box_h + 55
    canvas = Image.new("RGB", (canvas_w, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    draw.rounded_rectangle([2, 2, canvas_w - 3, total_h - 3], radius=6, outline=(226, 232, 240), width=1)
    draw.text((pad, 10), "ANSWER OPTIONS", fill=(15, 59, 93), font=FONT_HEADER)
    
    labels = ["(A)", "(B)", "(C)", "(D)"]
    for i, (oi, lbl) in enumerate(zip(opt_resized, labels)):
        bx = pad + i * (box_w + pad)
        by = 32
        
        draw.rounded_rectangle([bx, by, bx + box_w, by + box_h], radius=4, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
        draw.rounded_rectangle([bx, by, bx + box_w, by + 24], radius=4, fill=(241, 245, 249))
        draw.rectangle([bx, by + 20, bx + box_w, by + 24], fill=(241, 245, 249))
        draw.text((bx + (box_w - 20) // 2, by + 4), lbl, fill=(15, 59, 93), font=FONT_LABEL)
        
        ow, oh = oi.size
        ox = bx + (box_w - ow) // 2
        oy = by + 26 + (box_h - 28 - oh) // 2
        canvas.paste(oi, (ox, oy), oi)
        
    canvas.save(out_path, "WEBP", quality=82, method=6)

def create_single_problem(prob_path, out_path):
    """
    Clean, frame and compress a single Problem Figure
    """
    prob_img = trim_image(Image.open(prob_path))
    pw, ph = prob_img.size
    
    max_w = 640
    max_h = 320
    scale = min(max_w / pw, max_h / ph, 1.0)
    pw, ph = max(1, int(pw * scale)), max(1, int(ph * scale))
    prob_resized = prob_img.resize((pw, ph), Image.Resampling.LANCZOS)
    
    canvas_w = max(400, pw + 32)
    canvas_h = ph + 42
    
    canvas = Image.new("RGB", (canvas_w, canvas_h), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    draw.rounded_rectangle([2, 2, canvas_w - 3, canvas_h - 3], radius=6, outline=(226, 232, 240), width=1)
    draw.text((16, 8), "PROBLEM DIAGRAM", fill=(15, 59, 93), font=FONT_HEADER)
    
    px = (canvas_w - pw) // 2
    py = 30
    canvas.paste(prob_resized, (px, py), prob_resized)
    
    canvas.save(out_path, "WEBP", quality=85, method=6)

def main():
    print("Loading NTSEBench dataset from:", DATA_JSON_PATH)
    with open(DATA_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Total raw questions: {len(data)}")
    
    processed_questions = []
    total_source_images = 0
    total_original_bytes = 0
    total_compressed_bytes = 0
    
    question_idx = 1
    
    for item in data:
        cat_id = item.get("category")
        if cat_id not in CAT_NAMES:
            continue
            
        subject_name, topic_name = CAT_NAMES[cat_id]
        
        # Verify images
        prob_img_names = item.get("quesImages", [])
        opt_img_dict = item.get("optionImages", {})
        
        valid_prob_paths = []
        for name in prob_img_names:
            p = os.path.join(NTSE_BASE, "problemImages", name + ".png")
            if os.path.exists(p):
                valid_prob_paths.append(p)
                
        valid_opt_paths = {}
        for k in ["1", "2", "3", "4"]:
            subs = opt_img_dict.get(k, []) if isinstance(opt_img_dict, dict) else []
            for s in subs:
                p = os.path.join(NTSE_BASE, "optionImages", s + ".png")
                if os.path.exists(p):
                    valid_opt_paths[k] = p
                    break
                    
        has_prob = len(valid_prob_paths) > 0
        has_all_opts = len(valid_opt_paths) == 4
        
        if not has_prob and not has_all_opts:
            continue
            
        # Determine Answer
        ans_raw = item.get("answer", [1])
        correct_idx = 0
        if isinstance(ans_raw, list) and len(ans_raw) > 0 and isinstance(ans_raw[0], int):
            correct_idx = max(0, min(3, ans_raw[0] - 1))
            
        # Determine options text
        raw_opt_text = item.get("optionText", {})
        
        img_filename = f"nv_q_{question_idx:03d}.webp"
        out_img_path = os.path.join(OUTPUT_IMG_DIR, img_filename)
        public_img_url = f"/question-images/non-verbal/{img_filename}"
        
        # CASE 1: Both Problem & 4 Options
        if has_prob and has_all_opts:
            prob_path = valid_prob_paths[0]
            opt_paths = [valid_opt_paths[str(i)] for i in range(1, 5)]
            
            src_files = [prob_path] + opt_paths
            total_source_images += len(src_files)
            orig_bytes = sum(os.path.getsize(f) for f in src_files)
            total_original_bytes += orig_bytes
            
            create_composite_both(prob_path, opt_paths, out_img_path)
            
            comp_bytes = os.path.getsize(out_img_path)
            total_compressed_bytes += comp_bytes
            
            options = ["Option A", "Option B", "Option C", "Option D"]
            q_text = clean_text(item.get("directionText"), item.get("textPrompt"), subject_name)
            
        # CASE 2: Problem Image only, Text Options
        elif has_prob and not has_all_opts:
            prob_path = valid_prob_paths[0]
            src_files = [prob_path]
            total_source_images += 1
            orig_bytes = os.path.getsize(prob_path)
            total_original_bytes += orig_bytes
            
            create_single_problem(prob_path, out_img_path)
            
            comp_bytes = os.path.getsize(out_img_path)
            total_compressed_bytes += comp_bytes
            
            # Format text options
            opts = []
            for k in ["1", "2", "3", "4"]:
                val = str(raw_opt_text.get(k, f"Option {chr(64 + int(k))}")).strip()
                val = re.sub(r"\$", "", val).strip()
                opts.append(val if val else f"Option {chr(64 + int(k))}")
            options = opts
            q_text = clean_text(item.get("directionText"), item.get("textPrompt"), subject_name)
            
        # CASE 3: 4 Option Images Only (e.g. Odd one out, Venn Diagrams)
        elif not has_prob and has_all_opts:
            opt_paths = [valid_opt_paths[str(i)] for i in range(1, 5)]
            src_files = opt_paths
            total_source_images += len(src_files)
            orig_bytes = sum(os.path.getsize(f) for f in src_files)
            total_original_bytes += orig_bytes
            
            create_composite_options_only(opt_paths, out_img_path)
            
            comp_bytes = os.path.getsize(out_img_path)
            total_compressed_bytes += comp_bytes
            
            options = ["Option A", "Option B", "Option C", "Option D"]
            q_text = clean_text(item.get("directionText"), item.get("textPrompt"), subject_name)
        else:
            continue
            
        # Difficulty assignment
        diff = "medium"
        if cat_id in [14, 22, 10]:
            diff = "easy" if (question_idx % 3 == 0) else "medium"
        elif cat_id in [18, 19, 23]:
            diff = "hard" if (question_idx % 2 == 0) else "medium"
        else:
            diff = ["easy", "medium", "hard"][question_idx % 3]
            
        # Explanation
        explanation = f"Correct answer is Option {chr(65 + correct_idx)}. Evaluated under PMA {subject_name} standards."
        
        q_record = {
            "id": f"pma-nv-{question_idx:03d}",
            "sourceId": item.get("id"),
            "moduleType": "non-verbal",
            "subject": subject_name,
            "topic": topic_name,
            "questionText": q_text,
            "imageUrl": public_img_url,
            "options": options,
            "correctAnswerIndex": correct_idx,
            "difficulty": diff,
            "explanation": explanation,
            "disableOptionShuffle": True, # Keep Option A, B, C, D in place matching diagram labels!
            "status": "active"
        }
        
        processed_questions.append(q_record)
        question_idx += 1
        
    print(f"\n==========================================")
    print(f"PROCESSING COMPLETED SUCCESSFULLY!")
    print(f"Total Ready-Made Questions Created: {len(processed_questions)}")
    print(f"Total Source Images From NTSEBench: {total_source_images}")
    print(f"Original Raw Images Size: {total_original_bytes / (1024*1024):.2f} MB")
    print(f"Compressed WebP Diagrams Size: {total_compressed_bytes / (1024*1024):.2f} MB")
    saved_percent = (1 - total_compressed_bytes / total_original_bytes) * 100 if total_original_bytes else 0
    print(f"Compression Savings: {saved_percent:.1f}% reduction!")
    print(f"==========================================\n")
    
    # Save JSON
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(processed_questions, f, indent=2, ensure_ascii=False)
    print("Saved JSON to:", OUTPUT_JSON_PATH)
    
    # Save CSV
    with open(OUTPUT_CSV_PATH, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "moduleType", "subject", "topic", "questionText", "imageUrl",
            "optionA", "optionB", "optionC", "optionD",
            "correctAnswer", "difficulty", "explanation"
        ])
        for q in processed_questions:
            c_letter = chr(65 + q["correctAnswerIndex"])
            writer.writerow([
                q["moduleType"],
                q["subject"],
                q["topic"],
                q["questionText"],
                q["imageUrl"],
                q["options"][0],
                q["options"][1],
                q["options"][2],
                q["options"][3],
                c_letter,
                q["difficulty"],
                q["explanation"]
            ])
    print("Saved CSV to:", OUTPUT_CSV_PATH)

if __name__ == "__main__":
    main()

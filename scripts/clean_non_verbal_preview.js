const fs = require('fs');

function cleanNonVerbalQuestion(rawText, subject, topic) {
  if (!rawText) return "Select the correct figure for the given problem.";
  let text = String(rawText).trim();

  // 1. Remove LaTeX formatting
  text = text.replace(/\\mathbf\{([^}]*)\}/g, '$1');
  text = text.replace(/\\mathrm\{([^}]*)\}/g, '$1');
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');
  text = text.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2');
  text = text.replace(/\{90\}\^\\circ/g, '90°');
  text = text.replace(/\$\s*\\?\s*\{?\\?\s*\}?\s*\$/g, '');
  text = text.replace(/\$/g, '');

  // 2. Fix specific known OCR typos and quirks
  text = text.replace(/questic\s*n/gi, 'question');
  text = text.replace(/\bHee are\b/gi, 'Here are');
  text = text.replace(/\bThesre\b/gi, 'There');
  text = text.replace(/\btie same\b/gi, 'the same');
  text = text.replace(/\bnumbers are lace in figure\b/gi, 'numbers are placed in the figure');
  text = text.replace(/\bOne place in vacant\b/gi, 'One place is vacant');
  text = text.replace(/\bcoorect\b/gi, 'correct');
  text = text.replace(/\bHospita\b/gi, 'Hospital');
  text = text.replace(/\bthe the in the figure\b/gi, 'there in the figure');
  text = text.replace(/\bParralelograms\b/gi, 'parallelograms');
  text = text.replace(/\bwater-\s*image\b/gi, 'water image');
  text = text.replace(/\bmirror images\b/gi, 'mirror image');
  text = text.replace(/\bdirn\./gi, 'direction');
  text = text.replace(/\bwhich is different them the rext\b/gi, 'which is different from the rest.');

  // 3. Remove Direction/Question number prefixes
  // e.g., "Direction- In questions (98-99) if two figures..."
  // e.g., "(Question number 76 to 80) Out of the four figures..."
  // e.g., "Questions (26 to 030 ) : In this type of Question..."
  // e.g., "Questions (56 to 60) : Which of the following diagrams..."
  // e.g., "In Questions No. 30 to 33, find the correct..."
  // e.g., "Direction - (Question 81 - 83) Paper is folded..."
  // e.g., "(44-47) A square transparent sheet..."
  // e.g., "(1 to 3 ) In each of the following..."
  
  // Specific instruction replacements first
  if (/if two figures among five figures are interchanged/i.test(text)) {
    return "If two of the figures are interchanged, they will form a logical order. Find which two figures should be interchanged:";
  }

  if (/Out of the four figures.*three are similar.*One figure is not like/i.test(text) ||
      /three are similar in a certain way.*Choose the figure which is different/i.test(text) ||
      /Three terms \(figure\) are alike.*One term \(figure\) is different/i.test(text) ||
      /choose the figure which is different/i.test(text) ||
      /does not correlate with the rest of the figures.*Select that odd/i.test(text)) {
    return "Select the figure from the given alternatives which is different from the rest:";
  }

  if (/In this type of Question, a figure or a matrix is given in which some numbers are filled according to a rule/i.test(text) ||
      /numbers are placed in the figure on the basis of some rules.*One place is vacant.*replace/i.test(text) ||
      /numbers are arranged on the basis of some rules.*One place is vacant.*replace the question mark/i.test(text) ||
      /numbers are written with a specific rule.*decide which alternative will be/i.test(text)) {
    return "Find out which number will replace the question mark (?) according to the pattern:";
  }

  if (/There is a certain relationship between the numbers that are given in the following figure.*replace the question mark/i.test(text)) {
    return "Find the number that replaces the question mark (?) according to the pattern:";
  }

  if (/Each of the following questions consists of two sets of figures.*definite relationship between figures A and B.*establish a similar relationship between figures C and D/i.test(text) ||
      /Figures A and B are related in some manner.*Find the same relationship between figures C and D/i.test(text) ||
      /figure A and B are related in some Particular Manner.*Replace question mark for figure D.*same relationship between C and D/i.test(text) ||
      /specific relationship between the first and second figure.*same relationship exists between the third and fourth/i.test(text) ||
      /there are three problem figures followed by a question mark\(\?\) for the fourth one.*relationship between the first two/i.test(text) ||
      /terms left to the symbol :: is the same between the terms right to the symbol ::/i.test(text)) {
    return "Find the figure which bears the same relationship to the third figure as the second figure bears to the first:";
  }

  if (/Each of the following questions consists of the five figures.*Select a figure which will continue the same series/i.test(text) ||
      /Each of the following questions consists of five figures.*Select a figure which will continue the same series/i.test(text) ||
      /There is a sequence according to which the problem figures are arranged.*select an answer figure which can be added in sequence/i.test(text) ||
      /which figure among Alternatives, will replace the question mark according to series/i.test(text) ||
      /the s change in a particular order.*replace the question mark/i.test(text) ||
      /Choose next figure in sequence/i.test(text)) {
    return "Identify the figure from the given alternatives that replaces the question mark (?) and continues the series:";
  }

  if (/Each of the following questions consists of a set of three figures X,Y and Z showing a Sequence of folding/i.test(text) ||
      /Paper is folded as shown with the dotted lines in ' X ' & ' Y ' and the last figure 'Z' has been cut.*How would the paper look like when unfolded/i.test(text) ||
      /A square shaped paper is folded as shown in the figure.*when unfolded will look like/i.test(text) ||
      /A square piece of paper is folded and cut at specific spots.*when unfolded will look-like/i.test(text) ||
      /square transparent sheet with a pattern is folded along the dotted line.*Which of the following answer figures is formed/i.test(text) ||
      /transparent square shaped paper is folded along the dotted lines, which figure will be obtained/i.test(text)) {
    return "Find the figure that shows how the sheet will appear when unfolded along the crease lines:";
  }

  if (/choose the correct mirror image.*when mirror is placed on right/i.test(text) ||
      /find the correct mirror image of the given figure, when mirror is placed on right/i.test(text) ||
      /choose the mirror image from the alternatives/i.test(text) ||
      /Choose the mirror from the alternatives/i.test(text)) {
    // Check if there is a word/number to mirror at the end
    const wordMatch = text.match(/\b([A-Z]{3,}|\d{4,})\s*$/);
    if (wordMatch) {
      return `Find the correct mirror image of '${wordMatch[1]}' when the mirror is placed on the right:`;
    }
    return "Find the correct mirror image of the given figure when the mirror is placed on the right:";
  }

  if (/The reflection of an object as seen in water is called its water image.*Find the water image/i.test(text) ||
      /find the correct water image of the given figure/i.test(text)) {
    const wordMatch = text.match(/\b([A-Z]{3,}|[A-Za-z]{4,}|\d{4,})\s*$/);
    if (wordMatch) {
      return `Find the correct water reflection (water image) of '${wordMatch[1]}':`;
    }
    return "Find the correct water reflection (water image) of the given figure:";
  }

  if (/Five diagrams A,B,C,D,E are given.*Three out of these when put together make a square/i.test(text)) {
    return "Three of the five diagrams (A, B, C, D, E) when put together form a complete square. Find the set of three diagrams from the alternatives:";
  }

  if (/select the alternative which satisfy tie same condition of placement of dots/i.test(text) ||
      /satisfies the identical condition of placement of dots/i.test(text)) {
    return "Select the option figure that satisfies the identical condition of placement of dots as in the problem figure:";
  }

  if (/embedded in one of the answer figures.*Trace out that correct figure/i.test(text) ||
      /is embedded in one of the Answer figure.*Find the alternative in which it is embedded/i.test(text) ||
      /simple figures given in the alternatives is hidden in the complex figure/i.test(text)) {
    return "Identify the option figure in which the given problem figure is hidden or embedded:";
  }

  if (/Which of the answer-?figures will complete the matrix/i.test(text) ||
      /Find missing part of figure/i.test(text) ||
      /complete the given matrix figure/i.test(text) ||
      /Select the correct alternatives which can complete the figures/i.test(text) ||
      /find the correct alternative from the Answer figures to complete the/i.test(text)) {
    return "Select the figure from the options that correctly completes the missing part of the pattern:";
  }

  // Strip prefix like:
  // "Questions (56 to 60) : Which of the following diagrams indicates the best relationship between Mercury, Zinc and Metal?"
  // "(55-57) which of the following diagrams correctly represents the relation between given three items Universe, Earth, Europe"
  // "Direction -In question (17-23) find the missing term that will come in place of question mark."
  text = text.replace(/^(?:directions?\s*[:–—\-]?\s*)?(?:in\s+)?(?:questions?|questic\s*n)?\s*(?:nos?\.?)?\s*\(?[\d\s,toand–—\-]+\)?\s*[:–—\-]?\s*/i, '');
  text = text.replace(/^\(?[\d\s,toand–—\-]+\)?\s*[:–—\-]\s*/i, '');
  text = text.replace(/^instruction[s]?\s*[:–—\-]?\s*(?:in\s+question\s+numbers?\s*[\d\s,toand–—\-]+)?\s*[,:]?\s*/i, '');
  text = text.replace(/^questions?\s+image\s*/i, '');
  text = text.replace(/^questions?\s+figure\s*/i, '');
  text = text.replace(/^:\s*/, '');

  // Strip trailing suffixes like "Problem figures", "Answer figures", "Transparent sheet", etc.
  text = text.replace(/\s*(?:problem|answer)\s+figures?[:.]?/gi, '');
  text = text.replace(/\s*question-image\s+answer-image/gi, '');
  text = text.replace(/\s*answer\s+image/gi, '');
  text = text.replace(/\s*transparent\s+sheet/gi, '');
  text = text.replace(/\s*:\s*answer\s+figures?\s*:/gi, '');
  text = text.replace(/\s*:\s*$/, '');
  text = text.replace(/\s+\.?\s*s$/i, ''); // trailing lone 's'
  text = text.replace(/\s+I\s+II$/i, ''); // trailing dice markers

  // Fix Venn Diagram phrases
  // e.g. "which of the following diagrams correctly represents the relation between given three items Universe, Earth, Europe"
  text = text.replace(/relation(?:ship)? between (?:given three items )?([^?]+)\??/i, 'relationship between $1?');
  text = text.replace(/represents? ([^?]+)\s*\??/i, 'represents $1?');

  // Fix analytical reasoning lines
  text = text.replace(/^These Questions are based on analytical reasoning\.\s*/i, '');
  if (/^The number of triangles in the figure/i.test(text)) {
    text = "Find the number of triangles in the given figure:";
  }

  // Capitalize first letter
  text = text.trim();
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Add punctuation if missing
  if (text.length > 0 && !/[.?:!]$/.test(text)) {
    if (/^(which|what|how|who|where|determine|find|select|choose|identify)/i.test(text)) {
      if (/^(which|what|how|who|where)/i.test(text)) {
        text += "?";
      } else {
        text += ":";
      }
    } else {
      text += ".";
    }
  }

  return text;
}

const data = JSON.parse(fs.readFileSync('non_verbal_questions_ready.json', 'utf8'));
const cleaned = data.map(q => {
  return {
    id: q.id,
    subject: q.subject,
    oldText: q.questionText,
    newText: cleanNonVerbalQuestion(q.questionText, q.subject, q.topic)
  };
});

fs.writeFileSync('cleaned_preview.json', JSON.stringify(cleaned, null, 2), 'utf8');
console.log('Cleaned preview written for', cleaned.length, 'questions.');

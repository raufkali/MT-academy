// Authentic PMA Demonstration Questions and Default Tests
// Labeled clearly as sample content for development & testing

export const DEFAULT_TESTS = [
  {
    id: "pma-verbal-module",
    title: "Verbal Intelligence Test (PMA Long Course)",
    description: "Evaluates candidate logical reasoning, verbal analogies, series, coding-decoding, and classification.",
    moduleType: "verbal",
    durationMinutes: 30,
    questionCount: 84,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    subjects: ["Analogies", "Series Completion", "Coding-Decoding", "Classification", "Direction Sense"],
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    }
  },
  {
    id: "pma-nonverbal-module",
    title: "Non-Verbal Intelligence Test (PMA Long Course)",
    description: "Evaluates spatial visualization, pattern matrix completion, visual analogies, and odd-one-out figures.",
    moduleType: "non-verbal",
    durationMinutes: 30,
    questionCount: 64,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    subjects: ["Pattern Completion", "Series of Figures", "Analogy Figures", "Odd Figure Out"],
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    }
  },
  {
    id: "pma-academic-module",
    title: "Academic Test (PMA Long Course)",
    description: "Evaluates academic proficiency in English, Mathematics, Physics, Chemistry, and General Knowledge.",
    moduleType: "academic",
    durationMinutes: 30,
    questionCount: 50,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    subjects: ["English", "Mathematics", "Physics", "Chemistry", "General Knowledge", "Pak Studies"],
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    }
  },
  {
    id: "pma-full-mock",
    title: "Complete PMA Mock Examination (Full 3-in-1 Package)",
    description: "Official 3-stage elimination examination simulating the Pakistan Military Academy (PMA) initial computerized test: Verbal Intelligence (84 Qs, 30 Mins), Non-Verbal Intelligence (64 Qs, 30 Mins), and Academic Test (50 Qs, 30 Mins). Passing each stage is strictly required to unlock the next.",
    moduleType: "full-mock",
    durationMinutes: 90,
    questionCount: 198,
    passingPercentage: 50,
    randomizeQuestions: true,
    status: "active",
    subjects: ["Verbal Intelligence", "Non-Verbal Intelligence", "Academic"],
    testConfig: {
      moduleMix: {
        verbal: 84,
        "non-verbal": 64,
        academic: 50
      }
    },
    resultVisibility: {
      showOverallScore: true,
      showSectionScore: true,
      showAnswers: true,
      showExplanations: true
    }
  }
];

export const SAMPLE_QUESTIONS = [
  // VERBAL INTELLIGENCE
  {
    moduleType: "verbal",
    subject: "Analogies",
    topic: "Relationships",
    questionText: "Doctor is related to Stethoscope in the same way as Navigator is related to:",
    options: ["Microscope", "Compass", "Telescope", "Chronometer"],
    correctAnswerIndex: 1,
    explanation: "A stethoscope is the primary diagnostic instrument of a doctor; a compass is the primary directional instrument of a navigator.",
    difficulty: "medium",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Series Completion",
    topic: "Number Series",
    questionText: "What comes next in the following series? 3, 8, 15, 24, 35, ...?",
    options: ["46", "48", "49", "52"],
    correctAnswerIndex: 1,
    explanation: "The differences between consecutive terms are consecutive odd numbers: +5, +7, +9, +11, +13. Therefore, 35 + 13 = 48.",
    difficulty: "medium",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Classification",
    topic: "Odd One Out",
    questionText: "Choose the word that does NOT belong with the others:",
    options: ["Radar", "Sonar", "Compass", "Lidar"],
    correctAnswerIndex: 2,
    explanation: "Radar, Sonar, and Lidar operate on wave reflection and echo principles to detect objects; a compass operates on earth's magnetic field.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Coding-Decoding",
    topic: "Letter Coding",
    questionText: "If BRAVO is coded as CSBWP, how will DELTA be coded?",
    options: ["EFMUB", "EFMUC", "EEMTB", "EGMUB"],
    correctAnswerIndex: 0,
    explanation: "Each letter is shifted forward by 1 in the alphabet: B->C, R->S, A->B, V->W, O->P. DELTA shifts to EFMUB.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Direction Sense",
    topic: "Compass Directions",
    questionText: "A soldier marches 10 km North, turns right and marches 5 km, then turns right again and marches 10 km. How far and in which direction is he from his starting point?",
    options: ["5 km West", "5 km East", "10 km North", "Starting point"],
    correctAnswerIndex: 1,
    explanation: "The North and South movements of 10 km cancel out, leaving the soldier 5 km East of the origin.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Blood Relations",
    topic: "Kinship",
    questionText: "Pointing to a photograph of a gentleman, Ahmed said: 'His mother is the only daughter of my mother.' How is Ahmed related to the gentleman?",
    options: ["Father", "Maternal Uncle", "Brother", "Grandfather"],
    correctAnswerIndex: 1,
    explanation: "'The only daughter of my mother' is Ahmed's sister. The gentleman is the sister's son, making Ahmed his maternal uncle.",
    difficulty: "medium",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Analogies",
    topic: "Vocabulary",
    questionText: "CANDID is to FRANK as PRUDENT is to:",
    options: ["Careless", "Cautious", "Hasty", "Greedy"],
    correctAnswerIndex: 1,
    explanation: "Candid and Frank are synonyms; Prudent and Cautious are synonyms.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "verbal",
    subject: "Series Completion",
    topic: "Alphabet Series",
    questionText: "Find the missing letters: B, E, I, N, T, ...?",
    options: ["Y", "Z", "A", "B"],
    correctAnswerIndex: 2,
    explanation: "Letter increments are: +3, +4, +5, +6, +7. T (20) + 7 = 27, which wraps around to A (1st letter).",
    difficulty: "hard",
    status: "active"
  },

  // NON-VERBAL INTELLIGENCE
  {
    moduleType: "non-verbal",
    subject: "Series of Figures",
    topic: "Rotation and Element Addition",
    questionText: "A clock hand points at 12 o'clock, then 3 o'clock, then 6 o'clock. Where will it point in the next step?",
    options: ["7 o'clock", "8 o'clock", "9 o'clock", "11 o'clock"],
    correctAnswerIndex: 2,
    explanation: "The element rotates clockwise by 90 degrees in each step. After 6 o'clock (180 deg), 90 deg clockwise points to 9 o'clock (270 deg).",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "non-verbal",
    subject: "Odd Figure Out",
    topic: "Symmetry",
    questionText: "Which geometric figure has rotational symmetry but NO line of reflectional symmetry?",
    options: ["Square", "Equilateral Triangle", "Parallelogram (non-rectangle)", "Circle"],
    correctAnswerIndex: 2,
    explanation: "A general parallelogram has 180-degree rotational symmetry of order 2, but has zero lines of reflectional symmetry.",
    difficulty: "medium",
    status: "active"
  },
  {
    moduleType: "non-verbal",
    subject: "Pattern Completion",
    topic: "Grid Logic",
    questionText: "In a 3x3 matrix, row 1 has 1 dot, row 2 has 2 dots, row 3 has 3 dots. Column 1 has empty circle, column 2 has shaded square, column 3 has triangle. What figure completes the bottom-right cell?",
    options: ["Triangle with 1 dot", "Triangle with 2 dots", "Triangle with 3 dots", "Shaded square with 3 dots"],
    correctAnswerIndex: 2,
    explanation: "Row 3 requires 3 dots and column 3 requires a triangle shape. Hence, Triangle with 3 dots.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "non-verbal",
    subject: "Analogy Figures",
    topic: "Inversion and Shading",
    questionText: "If an upright white triangle transforms into an inverted black triangle, then an upright white pentagon transforms into:",
    options: ["Inverted black pentagon", "Upright black pentagon", "Inverted white pentagon", "Horizontal black pentagon"],
    correctAnswerIndex: 0,
    explanation: "The rule applies vertical inversion and color inversion (white to black).",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "non-verbal",
    subject: "Series of Figures",
    topic: "Segment Counting",
    questionText: "Sequence of polygon sides: Triangle (3 sides), Quadrilateral (4 sides), Pentagon (5 sides). What is the next figure in the series?",
    options: ["Octagon", "Hexagon", "Heptagon", "Decagon"],
    correctAnswerIndex: 1,
    explanation: "Sides increase by 1 at each consecutive step: 3, 4, 5, so the next is 6 sides (Hexagon).",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "non-verbal",
    subject: "Spatial Reasoning",
    topic: "Cube Folding",
    questionText: "In a standard six-sided die net, if face 1 is opposite face 6, face 2 is opposite face 5, which face is opposite face 3?",
    options: ["1", "2", "4", "5"],
    correctAnswerIndex: 2,
    explanation: "Opposite faces of standard dice always sum to 7: 3 + 4 = 7.",
    difficulty: "easy",
    status: "active"
  },

  // ACADEMIC TEST
  {
    moduleType: "academic",
    subject: "English",
    topic: "Prepositions",
    questionText: "He is fully confident ______ his success in the military ISSB test.",
    options: ["for", "about", "of", "in"],
    correctAnswerIndex: 2,
    explanation: "The adjective 'confident' takes the preposition 'of' (confident of something).",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "English",
    topic: "Vocabulary - Antonyms",
    questionText: "What is the exact antonym of the word 'VALIANT'?",
    options: ["Courageous", "Cowardly", "Stout", "Gallant"],
    correctAnswerIndex: 1,
    explanation: "Valiant means brave or heroic; cowardly is the direct antonym.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    questionText: "What are the roots of the quadratic equation x^2 - 7x + 12 = 0?",
    options: ["x = 2, 6", "x = 3, 4", "x = -3, -4", "x = 1, 12"],
    correctAnswerIndex: 1,
    explanation: "Factoring: (x - 3)(x - 4) = 0, giving x = 3 and x = 4.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "Mathematics",
    topic: "Trigonometry",
    questionText: "What is the exact value of sin(30°) + cos(60°)?",
    options: ["1/2", "1", "sqrt(3)/2", "2"],
    correctAnswerIndex: 1,
    explanation: "sin(30°) = 1/2 and cos(60°) = 1/2. Their sum is 1/2 + 1/2 = 1.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "Physics",
    topic: "Mechanics",
    questionText: "When a projectile is fired at an angle with the horizontal, at what angle is the horizontal range maximum?",
    options: ["30 degrees", "45 degrees", "60 degrees", "90 degrees"],
    correctAnswerIndex: 1,
    explanation: "Range R = (v^2 * sin(2θ)) / g. The term sin(2θ) is maximized at 1 when 2θ = 90°, so θ = 45°.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "Physics",
    topic: "Work and Energy",
    questionText: "If the velocity of a moving vehicle is doubled, its kinetic energy increases by a factor of:",
    options: ["2 times", "3 times", "4 times", "8 times"],
    correctAnswerIndex: 2,
    explanation: "Kinetic energy KE = 1/2 * m * v^2. Since KE is proportional to v^2, doubling velocity quadruples kinetic energy.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "General Knowledge",
    topic: "Pak Studies & Military History",
    questionText: "Who was the first recipient of Nishan-e-Haider, Pakistan's highest military gallantry award?",
    options: ["Major Raja Aziz Bhatti", "Captain Muhammad Sarwar Shaheed", "Major Shabbir Sharif", "Pilot Officer Rashid Minhas"],
    correctAnswerIndex: 1,
    explanation: "Captain Muhammad Sarwar Shaheed was martyred in Kashmir in 1948 and was posthumously awarded the first Nishan-e-Haider.",
    difficulty: "easy",
    status: "active"
  },
  {
    moduleType: "academic",
    subject: "General Knowledge",
    topic: "World Geography",
    questionText: "Which is the deepest oceanic trench in the world?",
    options: ["Java Trench", "Mariana Trench", "Puerto Rico Trench", "Sunda Trench"],
    correctAnswerIndex: 1,
    explanation: "The Mariana Trench located in the western Pacific Ocean reaches a maximum known depth of approximately 11,000 meters (Challenger Deep).",
    difficulty: "easy",
    status: "active"
  }
];

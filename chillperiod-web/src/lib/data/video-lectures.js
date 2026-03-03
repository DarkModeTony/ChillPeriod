/**
 * Video Lectures data curated from dotnotes.in
 * Maps semester → subject slug → video lecture entries
 * Slugs match exactly what is in the syllabus data
 * Each entry has: title, url (YouTube), author
 */

const videoLecturesData = {
  // ── Semester 1 ──
  firstsemesters: {
    'applied-mathematics-1': [
      { title: 'Engineering Mathematics 1 Full Course', url: 'https://www.youtube.com/watch?v=VLbFnMbRfhM', author: 'Gajendra Purohit' },
      { title: 'Matrices & Determinants', url: 'https://www.youtube.com/watch?v=rowWM-MijXU', author: 'Neso Academy' },
      { title: 'Engineering Maths 1 - All Topics', url: 'https://www.youtube.com/watch?v=xyAuNHPsq-g', author: 'GATE Smashers' },
    ],
    'applied-physics-1': [
      { title: 'Engineering Physics Full Course', url: 'https://www.youtube.com/watch?v=b1t41Q3xRM8', author: 'Physics Wallah' },
      { title: 'Quantum Mechanics - Engineering Physics', url: 'https://www.youtube.com/watch?v=p7bzE1E5PMY', author: 'Neso Academy' },
      { title: 'Engineering Physics Complete Playlist', url: 'https://www.youtube.com/watch?v=hyctIDPRSqY', author: '5 Minutes Engineering' },
    ],
    'applied-chemistry': [
      { title: 'Engineering Chemistry Full Course', url: 'https://www.youtube.com/watch?v=NMwSz2OK_Mk', author: 'GATE Smashers' },
      { title: 'Engineering Chemistry - All Units', url: 'https://www.youtube.com/watch?v=FRDiJzaXMEM', author: '5 Minutes Engineering' },
    ],
    'basic-chemistry': [
      { title: 'Engineering Chemistry Full Course', url: 'https://www.youtube.com/watch?v=NMwSz2OK_Mk', author: 'GATE Smashers' },
      { title: 'Chemistry for Engineers', url: 'https://www.youtube.com/watch?v=FRDiJzaXMEM', author: '5 Minutes Engineering' },
    ],
    'electrical-science': [
      { title: 'Basic Electrical Engineering', url: 'https://www.youtube.com/watch?v=r-SCyD7f_zI', author: 'Neso Academy' },
      { title: 'BEE Full Course', url: 'https://www.youtube.com/watch?v=OGcBROzSlds', author: 'GATE Smashers' },
      { title: 'Electrical Engineering Basics', url: 'https://www.youtube.com/watch?v=mc979OhitAg', author: 'Engineering Funda' },
    ],
    'programming-in-c': [
      { title: 'C Programming Full Course', url: 'https://www.youtube.com/watch?v=irqbmMNs2Bo', author: 'Jenny\'s Lectures' },
      { title: 'C Language Complete Tutorial', url: 'https://www.youtube.com/watch?v=ZSPZob_1TOk', author: 'Neso Academy' },
      { title: 'Problem Solving using C', url: 'https://www.youtube.com/watch?v=EjavYOFoJJ0', author: 'College Wallah' },
    ],
    'communications-skills': [
      { title: 'Communication Skills Complete', url: 'https://www.youtube.com/watch?v=HAnw168huqA', author: 'Ekeeda' },
    ],
    'environmental-studies': [
      { title: 'Environmental Studies Complete', url: 'https://www.youtube.com/watch?v=0zRJy2skpf8', author: 'Last Night Study' },
      { title: 'EVS Full Course for Engineering', url: 'https://www.youtube.com/watch?v=Nd3oxTF8ae0', author: 'Easy Engineering Classes' },
    ],
    'manufacturing-process': [
      { title: 'Manufacturing Process Full Course', url: 'https://www.youtube.com/watch?v=f3Xo3WNsKow', author: 'Mech Zone' },
    ],
  },

  // ── Semester 2 ──
  secondsemesters: {
    'applied-mathematics-2': [
      { title: 'Engineering Mathematics 2 Full Course', url: 'https://www.youtube.com/watch?v=z4xbniMVn7g', author: 'Gajendra Purohit' },
      { title: 'Differential Equations - Complete', url: 'https://www.youtube.com/watch?v=HQqODJKp7oE', author: 'Dr. Trefor Bazett' },
      { title: 'Engg Maths 2 All Topics', url: 'https://www.youtube.com/watch?v=0t0Qx2MoV_o', author: 'GATE Smashers' },
    ],
    'applied-physics-2': [
      { title: 'Engineering Physics 2 Full Course', url: 'https://www.youtube.com/watch?v=b1t41Q3xRM8', author: 'Physics Wallah' },
      { title: 'Applied Physics Lectures', url: 'https://www.youtube.com/watch?v=hyctIDPRSqY', author: '5 Minutes Engineering' },
    ],
    'engineering-mechanics': [
      { title: 'Engineering Mechanics Full Course', url: 'https://www.youtube.com/watch?v=gqFLghAOE6Y', author: 'CADD Centre' },
      { title: 'Engineering Mechanics Lectures', url: 'https://www.youtube.com/watch?v=naVw7bPiGSg', author: 'Ekeeda' },
    ],
    'environmental-studies': [
      { title: 'Environmental Studies Complete', url: 'https://www.youtube.com/watch?v=0zRJy2skpf8', author: 'Last Night Study' },
      { title: 'EVS Full Course for Engineering', url: 'https://www.youtube.com/watch?v=Nd3oxTF8ae0', author: 'Easy Engineering Classes' },
    ],
    'programming-in-c': [
      { title: 'C Programming Full Course', url: 'https://www.youtube.com/watch?v=irqbmMNs2Bo', author: 'Jenny\'s Lectures' },
      { title: 'C Language Complete Tutorial', url: 'https://www.youtube.com/watch?v=ZSPZob_1TOk', author: 'Neso Academy' },
    ],
    'basic-chemistry': [
      { title: 'Engineering Chemistry Full Course', url: 'https://www.youtube.com/watch?v=NMwSz2OK_Mk', author: 'GATE Smashers' },
    ],
  },

  // ── Semester 3 ──
  thirdsemesters: {
    'data-structures': [
      { title: 'Data Structures Full Course', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', author: 'freeCodeCamp' },
      { title: 'Data Structures Complete Playlist', url: 'https://www.youtube.com/watch?v=AT14lCXuMKI', author: 'Jenny\'s Lectures' },
      { title: 'DSA One Shot', url: 'https://www.youtube.com/watch?v=5_5oE5lgrhw', author: 'Love Babbar' },
      { title: 'Data Structures Using C', url: 'https://www.youtube.com/watch?v=_t2GVaQasRY', author: 'Abdul Bari' },
    ],
    'discrete-mathematics': [
      { title: 'Discrete Mathematics Full Course', url: 'https://www.youtube.com/watch?v=rdXw7Ps9vxc', author: 'Neso Academy' },
      { title: 'Discrete Maths Complete', url: 'https://www.youtube.com/watch?v=E6KSApOfOP4', author: 'GATE Smashers' },
      { title: 'Discrete Mathematics One Shot', url: 'https://www.youtube.com/watch?v=bLPKJN3hYEw', author: 'Knowledge Gate' },
    ],
    'digital-logic-and-computer-design': [
      { title: 'Digital Electronics Full Course', url: 'https://www.youtube.com/watch?v=M0mx8S05v60', author: 'Neso Academy' },
      { title: 'Digital Logic Design Complete', url: 'https://www.youtube.com/watch?v=nlBqSp0K7fo', author: 'GATE Smashers' },
      { title: 'Digital Logic One Shot', url: 'https://www.youtube.com/watch?v=rk0D6_-_K3M', author: 'Knowledge Gate' },
    ],
    'object-oriented-programming-using-c-p-p': [
      { title: 'OOPs in C++ Full Course', url: 'https://www.youtube.com/watch?v=wN0x9eZLix4', author: 'College Wallah' },
      { title: 'Object Oriented Programming C++', url: 'https://www.youtube.com/watch?v=xoL6WvCARJY', author: 'GATE Smashers' },
      { title: 'C++ OOPs Complete Playlist', url: 'https://www.youtube.com/watch?v=bSrm9RXwBaI', author: 'Kunal Kushwaha' },
    ],
    'computational-methods': [
      { title: 'Numerical Methods Full Course', url: 'https://www.youtube.com/watch?v=5GVkHySBBvU', author: '5 Minutes Engineering' },
      { title: 'Engineering Maths 3 Full Course', url: 'https://www.youtube.com/watch?v=7Gt4M6vZTL8', author: 'Gajendra Purohit' },
      { title: 'Complex Analysis Complete', url: 'https://www.youtube.com/watch?v=dEu5ie5ZMg4', author: 'Dr. Trefor Bazett' },
    ],
  },

  // ── Semester 4 ──
  fourthsemesters: {
    'theory-of-computation': [
      { title: 'TOC Unit-1 & 2', url: 'https://www.youtube.com/watch?v=58N2N7zJGrQ', author: 'Easy Engineering Classes' },
      { title: 'Turing Machine - Introduction', url: 'https://www.youtube.com/watch?v=PvLaPKPzq2I', author: 'Neso Academy' },
      { title: 'TOC Turing Machine Unit-3', url: 'https://www.youtube.com/watch?v=kYqb8mMqpIk', author: 'yash mittal' },
      { title: 'TOC UNIT-4 Complexity Theory', url: 'https://www.youtube.com/watch?v=oPSQKJUmfuI', author: 'Dotnotes' },
      { title: 'Complete TOC - Full Course', url: 'https://www.youtube.com/watch?v=gy9bCEMpMLg', author: 'GATE Smashers' },
      { title: 'Theory of Computation One Shot', url: 'https://www.youtube.com/watch?v=m0e_UbIGaGQ', author: 'Knowledge Gate' },
    ],
    'database-management-system': [
      { title: 'DBMS Complete Course', url: 'https://www.youtube.com/watch?v=kBdlM6hNDAE', author: 'GATE Smashers' },
      { title: 'DBMS Full Playlist', url: 'https://www.youtube.com/watch?v=6Iu45VZGQDk', author: 'Neso Academy' },
      { title: 'DBMS One Shot', url: 'https://www.youtube.com/watch?v=dl00fOOYLOM', author: 'Love Babbar' },
      { title: 'SQL Full Tutorial', url: 'https://www.youtube.com/watch?v=hlGoQC332VM', author: 'freeCodeCamp' },
    ],
    'programming-in-java': [
      { title: 'Java Full Course', url: 'https://www.youtube.com/watch?v=UmnCZ7-9yDY', author: 'Bro Code' },
      { title: 'Java Programming Complete', url: 'https://www.youtube.com/watch?v=hBh_CC5y8-s', author: 'Kunal Kushwaha' },
      { title: 'Java OOPs Concepts', url: 'https://www.youtube.com/watch?v=bSrm9RXwBaI', author: 'Apna College' },
    ],
    'probability-statistics-and-linear-programming': [
      { title: 'Probability & Statistics Full Course', url: 'https://www.youtube.com/watch?v=xxpc-HPKN28', author: 'GATE Smashers' },
      { title: 'Statistics for Engineers', url: 'https://www.youtube.com/watch?v=W1SY0gZ77EY', author: 'Gajendra Purohit' },
    ],
    'circuits-and-systems': [
      { title: 'Signals & Systems Full Course', url: 'https://www.youtube.com/watch?v=s8rsR_TStaA', author: 'Neso Academy' },
      { title: 'Circuits & Systems Complete', url: 'https://www.youtube.com/watch?v=F_vLWkkOETI', author: 'Neso Academy' },
    ],
  },

  // ── Semester 5 ──
  fifthsemesters: {
    'operating-systems': [
      { title: 'Operating Systems Full Course', url: 'https://www.youtube.com/watch?v=bkSWJJZNgf8', author: 'GATE Smashers' },
      { title: 'OS Complete Playlist', url: 'https://www.youtube.com/watch?v=vBURTt97EkA', author: 'Neso Academy' },
      { title: 'Operating Systems One Shot', url: 'https://www.youtube.com/watch?v=3obEP8eLsCw', author: 'Love Babbar' },
      { title: 'Operating System - All Concepts', url: 'https://www.youtube.com/watch?v=xw_OuOhjauw', author: 'Knowledge Gate' },
    ],
    'compiler-design': [
      { title: 'Compiler Design Full Course', url: 'https://www.youtube.com/watch?v=Qkwj65l_96I', author: 'GATE Smashers' },
      { title: 'Compiler Design Complete', url: 'https://www.youtube.com/watch?v=wbXSTAJBfMY', author: 'Knowledge Gate' },
      { title: 'Compiler Design One Shot', url: 'https://www.youtube.com/watch?v=_C4wEBStLuE', author: 'Easy Engineering Classes' },
    ],
    'computer-networks': [
      { title: 'Computer Networks Full Course', url: 'https://www.youtube.com/watch?v=JFF2vJaN0Cw', author: 'GATE Smashers' },
      { title: 'CN Complete Playlist', url: 'https://www.youtube.com/watch?v=VwN91x5i25g', author: 'Neso Academy' },
      { title: 'Computer Networks One Shot', url: 'https://www.youtube.com/watch?v=qiQR5rTSshw', author: 'Love Babbar' },
    ],
    'software-engineering': [
      { title: 'Software Engineering Full Course', url: 'https://www.youtube.com/watch?v=uJpQHWDaGIo', author: 'GATE Smashers' },
      { title: 'SE Complete Playlist', url: 'https://www.youtube.com/watch?v=9Bsat6RmJXQ', author: 'Knowledge Gate' },
      { title: 'Software Engineering One Shot', url: 'https://www.youtube.com/watch?v=_BiJ3yBYiVk', author: 'Easy Engineering Classes' },
    ],
    'design-and-analysis-of-algorithm': [
      { title: 'DAA Full Course', url: 'https://www.youtube.com/watch?v=u4h-2YPknAg', author: 'Abdul Bari' },
      { title: 'Design & Analysis of Algorithms', url: 'https://www.youtube.com/watch?v=WQsxmFmpIbQ', author: 'GATE Smashers' },
      { title: 'Algorithms Playlist', url: 'https://www.youtube.com/watch?v=0IAPZzGSbME', author: 'Abdul Bari' },
    ],
    'economics-for-engineers': [
      { title: 'Engineering Economics Full Course', url: 'https://www.youtube.com/watch?v=nLre9PFwneo', author: 'Last Night Study' },
      { title: 'Economics for Engineers', url: 'https://www.youtube.com/watch?v=vJ3bzrr_yes', author: '5 Minutes Engineering' },
    ],
  },

  // ── Semester 6 ──
  sixthsemesters: {
    'artificial-intelligence': [
      { title: 'Artificial Intelligence Full Course', url: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', author: 'GATE Smashers' },
      { title: 'AI Complete Playlist', url: 'https://www.youtube.com/watch?v=ad79nYk2keg', author: 'Knowledge Gate' },
      { title: 'Introduction to AI', url: 'https://www.youtube.com/watch?v=9gGnTQTYNaE', author: 'Edureka' },
    ],
    'machine-learning': [
      { title: 'Machine Learning Full Course', url: 'https://www.youtube.com/watch?v=JxgmHe2NyeY', author: 'GATE Smashers' },
      { title: 'ML Complete Playlist', url: 'https://www.youtube.com/watch?v=gmvvaobm7eQ', author: '5 Minutes Engineering' },
      { title: 'Machine Learning Tutorial', url: 'https://www.youtube.com/watch?v=NWONeJKn6kc', author: 'Krish Naik' },
    ],
    'artificial-intelligence-and-machine-learning': [
      { title: 'AI & ML Full Course', url: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', author: 'GATE Smashers' },
      { title: 'Machine Learning Tutorial', url: 'https://www.youtube.com/watch?v=NWONeJKn6kc', author: 'Krish Naik' },
    ],
    'web-technologies': [
      { title: 'Web Technology Full Course', url: 'https://www.youtube.com/watch?v=Q33KBiDriJY', author: 'College Wallah' },
      { title: 'HTML CSS JS Complete', url: 'https://www.youtube.com/watch?v=HcOc7P5BMi4', author: 'Apna College' },
      { title: 'Web Development Full Course', url: 'https://www.youtube.com/watch?v=zJSY8tbf_ys', author: 'freeCodeCamp' },
    ],
    'network-security-and-cryptography': [
      { title: 'Cryptography & Network Security', url: 'https://www.youtube.com/watch?v=JoeiLuFNBc4', author: 'Neso Academy' },
      { title: 'Information Security Full Course', url: 'https://www.youtube.com/watch?v=hXSFdwIOfnE', author: 'GATE Smashers' },
      { title: 'Cyber Security Complete', url: 'https://www.youtube.com/watch?v=PlHnamdwGmw', author: 'Knowledge Gate' },
    ],
    'advanced-java-programming': [
      { title: 'Advanced Java Full Course', url: 'https://www.youtube.com/watch?v=Ae-r8hsbPUo', author: 'Telusko' },
      { title: 'Java EE Tutorials', url: 'https://www.youtube.com/watch?v=UmnCZ7-9yDY', author: 'Bro Code' },
    ],
    'programming-in-python': [
      { title: 'Python Full Course', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', author: 'Mosh Hamedani' },
      { title: 'Python for Beginners', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', author: 'freeCodeCamp' },
      { title: 'Python Complete Tutorial', url: 'https://www.youtube.com/watch?v=gfDE2a7MKjA', author: 'Edureka' },
    ],
    'microprocessors-and-interfacing': [
      { title: 'Microprocessor 8085 Full Course', url: 'https://www.youtube.com/watch?v=ME3Nh9l88So', author: 'Neso Academy' },
      { title: 'Microprocessor Complete', url: 'https://www.youtube.com/watch?v=mszh7Ej0mVg', author: 'GATE Smashers' },
      { title: 'Microprocessor & Interfacing', url: 'https://www.youtube.com/watch?v=r7NONkgRAGw', author: 'Easy Engineering Classes' },
    ],
    'blockchain-technology': [
      { title: 'Blockchain Full Course', url: 'https://www.youtube.com/watch?v=QCvL-DWcojc', author: 'Edureka' },
      { title: 'Blockchain Technology Complete', url: 'https://www.youtube.com/watch?v=gyMwXuJrbJQ', author: 'freeCodeCamp' },
    ],
    'mobile-computing': [
      { title: 'Mobile Computing Full Course', url: 'https://www.youtube.com/watch?v=cI1YbPqHxkI', author: 'GATE Smashers' },
      { title: 'Mobile Communication Lectures', url: 'https://www.youtube.com/watch?v=o4PJjMSJdqI', author: 'Knowledge Gate' },
    ],
    'parallel-computing': [
      { title: 'Parallel Computing Full Course', url: 'https://www.youtube.com/watch?v=eaZ7zz0mEBU', author: 'NPTEL' },
    ],
    'programming-in-java': [
      { title: 'Java Full Course', url: 'https://www.youtube.com/watch?v=UmnCZ7-9yDY', author: 'Bro Code' },
      { title: 'Java Programming Complete', url: 'https://www.youtube.com/watch?v=hBh_CC5y8-s', author: 'Kunal Kushwaha' },
    ],
    'data-analytics': [
      { title: 'Data Analytics Full Course', url: 'https://www.youtube.com/watch?v=yZvFH7B6gKI', author: 'Edureka' },
      { title: 'Data Analysis with Python', url: 'https://www.youtube.com/watch?v=GPVsHOlRBBI', author: 'freeCodeCamp' },
    ],
    'digital-image-processing': [
      { title: 'Digital Image Processing Full Course', url: 'https://www.youtube.com/watch?v=fWvUvEfN2Tw', author: 'GATE Smashers' },
      { title: 'Image Processing Complete', url: 'https://www.youtube.com/watch?v=C6VYm4at4JM', author: 'Knowledge Gate' },
    ],
    'principles-of-programming-languages': [
      { title: 'Programming Languages Concepts', url: 'https://www.youtube.com/watch?v=rIqNRbHWCH4', author: 'Easy Engineering Classes' },
    ],
    'quantum-computing': [
      { title: 'Quantum Computing Full Course', url: 'https://www.youtube.com/watch?v=F_Riqjdh2oM', author: 'IBM Technology' },
    ],
    'web-development-using-mern-stack': [
      { title: 'MERN Stack Full Course', url: 'https://www.youtube.com/watch?v=CvCiNeLnZ00', author: 'freeCodeCamp' },
      { title: 'MERN Stack Project Tutorial', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', author: 'JavaScript Mastery' },
    ],
    'android-app-development': [
      { title: 'Android Development Full Course', url: 'https://www.youtube.com/watch?v=fis26HvvDII', author: 'freeCodeCamp' },
      { title: 'Android App Development Tutorial', url: 'https://www.youtube.com/watch?v=aS__9RbCyHg', author: 'Coding With Mitch' },
    ],
    'introduction-to-internet-of-things': [
      { title: 'IoT Full Course', url: 'https://www.youtube.com/watch?v=LlhmzVL5bm8', author: 'Edureka' },
      { title: 'Internet of Things Complete', url: 'https://www.youtube.com/watch?v=h0gWfVCSGQQ', author: 'GATE Smashers' },
    ],
  },

  // ── Semester 7 ──
  seventhsemesters: {
    'big-data-analytics': [
      { title: 'Big Data Full Course', url: 'https://www.youtube.com/watch?v=KCEPoPJ8sWw', author: 'Edureka' },
      { title: 'Big Data Analytics Complete', url: 'https://www.youtube.com/watch?v=yZvFH7B6gKI', author: 'GATE Smashers' },
    ],
    'machine-learning': [
      { title: 'Machine Learning Full Course', url: 'https://www.youtube.com/watch?v=JxgmHe2NyeY', author: 'GATE Smashers' },
      { title: 'Machine Learning Tutorial', url: 'https://www.youtube.com/watch?v=NWONeJKn6kc', author: 'Krish Naik' },
    ],
    'reinforcement-learning-and-deep-learning': [
      { title: 'Deep Learning Full Course', url: 'https://www.youtube.com/watch?v=VyWAvY2CF9c', author: 'Krish Naik' },
      { title: 'Neural Networks Complete', url: 'https://www.youtube.com/watch?v=aircAruvnKk', author: '3Blue1Brown' },
    ],
    'blockchain-technology': [
      { title: 'Blockchain Full Course', url: 'https://www.youtube.com/watch?v=QCvL-DWcojc', author: 'Edureka' },
      { title: 'Blockchain Technology Complete', url: 'https://www.youtube.com/watch?v=gyMwXuJrbJQ', author: 'freeCodeCamp' },
    ],
    'cloud-computing-and-security': [
      { title: 'Cloud Computing Full Course', url: 'https://www.youtube.com/watch?v=EN4fEbcFZ_E', author: 'Edureka' },
      { title: 'Cloud Computing Complete', url: 'https://www.youtube.com/watch?v=_a6us8kaq0g', author: 'GATE Smashers' },
    ],
    'ethical-hacking': [
      { title: 'Ethical Hacking Full Course', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', author: 'freeCodeCamp' },
      { title: 'Ethical Hacking Complete', url: 'https://www.youtube.com/watch?v=dz7Ntp7KQGA', author: 'Edureka' },
    ],
    'data-warehousing-and-data-mining': [
      { title: 'Data Mining Full Course', url: 'https://www.youtube.com/watch?v=2WyScx2KQ30', author: 'GATE Smashers' },
      { title: 'Data Mining & Warehousing', url: 'https://www.youtube.com/watch?v=PXhFoApYBOM', author: 'Knowledge Gate' },
    ],
    'data-science': [
      { title: 'Data Science Full Course', url: 'https://www.youtube.com/watch?v=-ETQ97mXXF0', author: 'Edureka' },
      { title: 'Data Science Tutorial', url: 'https://www.youtube.com/watch?v=ua-CiDNNj30', author: 'freeCodeCamp' },
    ],
    'computer-vision': [
      { title: 'Computer Vision Full Course', url: 'https://www.youtube.com/watch?v=fWvUvEfN2Tw', author: 'GATE Smashers' },
      { title: 'OpenCV Full Course', url: 'https://www.youtube.com/watch?v=oXlwWbU8l2o', author: 'freeCodeCamp' },
    ],
    'distributed-systems-and-cloud-computing': [
      { title: 'Distributed Systems Full Course', url: 'https://www.youtube.com/watch?v=cQP8WApzIQQ', author: 'MIT OpenCourseWare' },
      { title: 'Distributed Computing', url: 'https://www.youtube.com/watch?v=UEAMfLPZZhE', author: 'GATE Smashers' },
    ],
    'network-security-and-cryptography': [
      { title: 'Cryptography & Network Security', url: 'https://www.youtube.com/watch?v=JoeiLuFNBc4', author: 'Neso Academy' },
      { title: 'Network Security Full Course', url: 'https://www.youtube.com/watch?v=hXSFdwIOfnE', author: 'GATE Smashers' },
    ],
    'mobile-app-development': [
      { title: 'Mobile App Development Full Course', url: 'https://www.youtube.com/watch?v=fis26HvvDII', author: 'freeCodeCamp' },
      { title: 'React Native Full Course', url: 'https://www.youtube.com/watch?v=obH0Po_RdWk', author: 'Academind' },
    ],
    'web-mining': [
      { title: 'Web Mining & NLP', url: 'https://www.youtube.com/watch?v=CMrHM8a3hqw', author: 'Krish Naik' },
    ],
    'pattern-recognition-and-computer-vision': [
      { title: 'Pattern Recognition Full Course', url: 'https://www.youtube.com/watch?v=fWvUvEfN2Tw', author: 'GATE Smashers' },
    ],
    'artificial-intelligence-applications': [
      { title: 'AI Applications Full Course', url: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', author: 'GATE Smashers' },
    ],
    'software-verification-validation-and-testing': [
      { title: 'Software Testing Full Course', url: 'https://www.youtube.com/watch?v=sO8eGL6SFsA', author: 'GATE Smashers' },
      { title: 'Software Testing Complete', url: 'https://www.youtube.com/watch?v=YWu9HEs1JBs', author: 'Edureka' },
    ],
  },

  // ── Semester 8 — no data ──
};

/**
 * Get video lectures for a specific subject in a semester.
 * @param {string} semesterValue - e.g. "fifthsemesters"
 * @param {string} subjectSlug - e.g. "theory-of-computation"
 * @returns {Array} Array of { title, url, author } or empty array
 */
export function getVideoLectures(semesterValue, subjectSlug) {
  const semData = videoLecturesData[semesterValue];
  if (!semData) return [];
  return semData[subjectSlug] || [];
}

/**
 * Build a dotnotes.in subject link (for "View all on Dotnotes").
 * @param {string} subjectSlug - e.g. "theory-of-computation"
 * @returns {string} Full URL to dotnotes subject page
 */
export function getDotnotesVideoLink(subjectSlug) {
  return `https://dotnotes.in/subject/${subjectSlug}`;
}

/**
 * Extract YouTube video ID from a URL.
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

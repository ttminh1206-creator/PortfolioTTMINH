/* =========================================================================
   data.js — ALL portfolio content lives here.
   Edit text, add items or images in this file only; pages render from it.
   Source of truth: MasterCV_TTMINH.docx + Materials/ (see content-summary.md)
   ========================================================================= */

/* Helper: build a gallery from numbered images  assets/img/<prefix>-1.jpg ...
   Pass one caption (used as alt text) per image, in order. */
function gallery(prefix, captions) {
  return captions.map((alt, i) => ({ src: `assets/img/${prefix}-${i + 1}.jpg`, alt }));
}

window.PORTFOLIO = {
  /* ---------------------------------------------------------------------
     PROFILE
     --------------------------------------------------------------------- */
  profile: {
    name: "Tran Thanh Minh",
    title: "Environmental Researcher & Analyst",
    subtitle: "PhD Candidate · Chulalongkorn University",
    // **…** is highlighted on the page
    tagline:
      "I turn **field data, maps and multi-criteria analysis** into practical recommendations that help **decision-makers and planners** manage coasts and the environment.",
    avatar: "assets/img/avatar.jpg",
    location: "Bangkok, Thailand · Ho Chi Minh City, Vietnam",
    emails: [
      "ttminh1206@gmail.com",
      "thanhminh@hcmier.edu.vn"
    ],
    phones: [
      { label: "Vietnam", value: "+84 971 245 697" },
      { label: "Thailand", value: "+66 99 010 5625" }
    ],
    socials: [
      { label: "Google Scholar", icon: "graduation-cap", url: "https://scholar.google.com/citations?user=aYerKpMAAAAJ&hl=en" },
      { label: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/in/minh-tran-8a89972b8" },
      { label: "ORCID", icon: "id-card", url: "https://orcid.org/0009-0006-5544-5252" }
    ]
  },

  /* ---------------------------------------------------------------------
     ABOUT
     --------------------------------------------------------------------- */
  about: {
    paragraphs: [
      "I am an environmental researcher with five years of hands-on experience in environmental impact assessment, compliance monitoring, environmental permitting and coastal risk and sustainability research for government-commissioned projects in Vietnam.",
      "I am currently a PhD candidate in Hazardous Substance and Environmental Management at Chulalongkorn University, and author or co-author of nine publications. I also work remotely as an AI training contributor, annotating speech data and evaluating AI-generated outputs against detailed guidelines."
    ],
    focus:
      "Research focus: coastal risk and vulnerability assessment, climate change, and nature-based solutions under future sea-level rise and land-use change scenarios.",
    values: [
      { icon: "search-check", title: "Verified evidence", text: "Technical content checked against national standards and published sources." },
      { icon: "file-pen-line", title: "Documented reasoning", text: "A written justification behind every technical decision." },
      { icon: "messages-square", title: "Clear communication", text: "Findings translated into recommendations decision-makers can use." }
    ]
  },

  /* ---------------------------------------------------------------------
     HEADLINE NUMBERS
     --------------------------------------------------------------------- */
  stats: [
    { value: 5, suffix: "+", label: "Years of experience", icon: "calendar-check" },
    { value: 30, suffix: "+", label: "Projects", icon: "folder-kanban" },
    { value: 9, suffix: "", label: "Publications", icon: "book-open-text" }
  ],

  /* ---------------------------------------------------------------------
     SKILLS — badge: assess | analysis | comm | ai (illustrations in main.js)
     --------------------------------------------------------------------- */
  skills: [
    { group: "Assessment & Compliance", badge: "assess",
      items: ["Environmental impact assessment (EIA)", "Environmental & wastewater discharge permitting", "Risk, vulnerability & sensitivity assessment", "Monitoring network design", "Field survey & sampling coordination"] },
    { group: "Analysis & Modelling", badge: "analysis",
      items: ["MCDA (AHP, SAW, GBWM)", "Composite index development", "GIS & remote sensing (ArcGIS, ENVI)", "Statistics (SPSS)", "Excel data analysis", "SWOT analysis"] },
    { group: "Communication & Coordination", badge: "comm",
      items: ["Technical & academic writing (English)", "Regulatory & client reporting", "Presentations for government agencies", "Data visualisation & mapping", "Project planning & coordination", "Tender & proposal preparation", "Stakeholder liaison"] },
    { group: "AI Training & Data Annotation", badge: "ai",
      items: ["Speech transcription (ASR)", "Transcript & timestamp QA", "Pairwise preference ranking", "Rubric-based evaluation of AI outputs"] }
  ],

  /* ---------------------------------------------------------------------
     EDUCATION (education.html) — oldest first; the page draws it bottom-up
     --------------------------------------------------------------------- */
  education: [
    {
      level: "Bachelor of Engineering",
      short: "Bachelor",
      years: "2017 – 2021",
      school: "Ho Chi Minh City University of Technology (HCMUT), VNU-HCM",
      faculty: "Faculty of Environment and Natural Resources",
      major: "Resources and Environmental Management",
      location: "Ho Chi Minh City, Vietnam",
      result: "GPA 3.5/4.0 · Valedictorian",
      thesis: "Improvement of a tubular photobioreactor system for microalgae-based air pollution treatment",
      achievements: [
        "Valedictorian and Gold Medal (awarded at the 2022 ceremony)",
        "Academic Merit Scholarship in 7 of 8 semesters",
        "\"5-Good Student\" Award, HCMUT and VNU-HCM levels (2022)",
        "NITORI International Scholarship (2021)",
        "Second Prize, Smart Cities Contest, National GIS Conference (2020)",
        "First-author paper presented at ICoGEE 2021"
      ],
      images: gallery("activity-graduation-bachelor", [
        "Holding the valedictorian trophy, medal and certificate",
        "Celebrating graduation day together",
        "Graduation day with the valedictorian trophy",
        "Celebrating with the Gold Medal and trophy"
      ]),
      link: "detail.html?id=graduation-bachelor",
      icon: "sprout"
    },
    {
      level: "Master of Engineering",
      short: "Master",
      years: "2022 – 2024",
      school: "Ho Chi Minh City University of Technology (HCMUT), VNU-HCM",
      faculty: "Faculty of Environment and Natural Resources",
      major: "Natural Resources and Environmental Management",
      location: "Ho Chi Minh City, Vietnam",
      result: "GPA 4.0/4.0",
      thesis: "Application of multi-criteria decision analysis and GIS to assess coastal vulnerability to tourism development in Ba Ria–Vung Tau province, Vietnam",
      achievements: [
        "Postgraduate Scholarship for Valedictorian Graduates, HCMUT (2022)",
        "Postgraduate Scholarship, Taiwan Businessmen's Scholarship Fund in Vietnam (2023)",
        "Studied while working as a researcher at IER, VNU-HCM",
        "Thesis research published as first author in IJESD (2025)"
      ],
      images: gallery("activity-graduation-master", [
        "Receiving the Master's degree on stage, November 2024",
        "Celebrating the Master's graduation together on campus",
        "Graduation ceremony of the Faculty of Environment and Natural Resources"
      ]),
      link: "detail.html?id=graduation-master",
      icon: "leaf"
    },
    {
      level: "PhD Candidate",
      short: "PhD",
      years: "2025 – Present",
      school: "Chulalongkorn University",
      faculty: "Graduate School · International Program (English-medium)",
      major: "Hazardous Substance and Environmental Management",
      location: "Bangkok, Thailand",
      result: "Fully funded scholarship (2025–2028)",
      thesis: "Research focus: coastal risk and vulnerability assessment, climate change, and nature-based solutions under future sea-level rise and land-use change scenarios",
      achievements: [
        "Chulalongkorn University Graduate Scholarship, fully funded (2025–2028)",
        "Vietnamese Young Scientific Researcher in Thailand Award (2026)",
        "UNSSC & UNDRR course on disaster risk reduction and climate adaptation (2026)"
      ],
      images: gallery("activity-phd-chula", [
        "At the Center of Excellence on Hazardous Substance Management, home of the international PhD program",
        "HSM Research Laboratory",
        "First days in Bangkok and at Chulalongkorn University",
        "With PhD classmates",
        "Exploring a temple in Bangkok"
      ]).concat([{ src: "assets/img/activity-vsat-2026-1.jpg", alt: "Young Scientific Researcher in Thailand 2026 award" }]),
      link: "detail.html?id=phd-chula",
      icon: "trees"
    }
  ],

  /* ---------------------------------------------------------------------
     WORK EXPERIENCE (home page) — newest first
     --------------------------------------------------------------------- */
  work: [
    { date: "2025 – Present", title: "Researcher", org: "Institute for Environment and Resources (IER), VNU-HCM", unit: "Center for Sustainable Development & Biodiversity",
      text: "Environmental research and consultancy for government-commissioned projects, coordinated remotely from Bangkok." },
    { date: "11/2021 – 2025", title: "Researcher", org: "Institute for Environment and Resources (IER), VNU-HCM", unit: "Department of Integrated Coastal Zone Management",
      text: "Coastal risk, vulnerability and sustainability research; environmental monitoring, EIA, permitting and bid preparation." },
    { date: "09/2026 – Present", title: "AI Training Contributor", org: "Outlier", unit: "Remote · part-time alongside the PhD",
      text: "Speech transcription, transcript verification and rubric-based evaluation of AI-generated outputs." }
  ],

  /* ---------------------------------------------------------------------
     AWARDS & CERTIFICATES
     --------------------------------------------------------------------- */
  awards: [
    { year: "2026", title: "Vietnamese Young Scientific Researcher in Thailand Award", org: "Vietnamese Students' Association in Thailand", icon: "trophy", link: "detail.html?id=vsat-2026" },
    { year: "2025–2028", title: "Chulalongkorn University Graduate Scholarship", org: "Fully funded PhD scholarship", icon: "graduation-cap" },
    { year: "2023", title: "Postgraduate Scholarship", org: "Taiwan Businessmen's Scholarship Fund in Vietnam", icon: "hand-coins" },
    { year: "2022", title: "Postgraduate Scholarship for Valedictorian Graduates", org: "HCMUT", icon: "hand-coins" },
    { year: "2022", title: "Valedictorian & Gold Medal, Bachelor's Degree", org: "HCMUT", icon: "medal", link: "detail.html?id=graduation-bachelor" },
    { year: "2022", title: "\"5-Good Student\" Award", org: "HCMUT and VNU-HCM levels", icon: "star" },
    { year: "2021", title: "NITORI International Scholarship", org: "Academic excellence", icon: "hand-coins" },
    { year: "2020", title: "Second Prize, Smart Cities Contest", org: "National GIS Conference, HCMUT", icon: "award", link: "detail.html?id=smart-cities-2020" },
    { year: "2017–2022", title: "Academic Merit Scholarship", org: "HCMUT, 7 of 8 semesters", icon: "book-open-check" }
  ],
  certificates: [
    { year: "2026", title: "Promoting Coherence between Disaster Risk Reduction and Climate Change Adaptation", org: "UNSSC & UNDRR · Module 1, Synergizing DRR and Climate Action Learning Path", icon: "badge-check", link: "detail.html?id=unssc-undrr-course" }
  ],

  /* ---------------------------------------------------------------------
     PUBLICATIONS (research.html). Mark own name with **…**
     link: DOI URL, or a local PDF (set linkType: "pdf")
     --------------------------------------------------------------------- */
  publications: [
    { year: 2027, authors: "**Tran, M.T.**, Tran, L.T.D., Nguyen, M.L., Le, C.T.", title: "Development of a Composite Sustainability Index within an Integrated Coastal Zone Management Framework: A Case Study of Ho Chi Minh City, Vietnam", venue: "Applied Environmental Research", details: "49(1), 002", type: "International journal", link: "https://doi.org/10.35762/AER.2027002" },
    { year: 2026, authors: "Tran, L.T.D., **Tran, M.T.**, Le, C.T., Nguyen, M.L.", title: "Environmental vulnerability assessment of the coastal region of Ba Ria–Vung Tau province, Vietnam: An integrated geospatial approach", venue: "Journal of Sustainability Science and Management", details: "In press", type: "International journal", link: "" },
    { year: 2025, authors: "**Tran, M.T.**, Tran, L.T.D., Do, D.S., Tran, D.A., Le, C.T.", title: "Environmental Vulnerability Assessment in Coastal Areas with Intensive Tourism Activities: A Case Study in Ba Ria–Vung Tau Province, Vietnam", venue: "International Journal of Environmental Science and Development", details: "16(5), 353–363 · Scopus Q4", type: "International journal", link: "https://doi.org/10.18178/ijesd.2025.16.5.1544" },
    { year: 2024, authors: "Tran, L.T.D., Le, C.T., **Tran, M.T.**", title: "Coastal Sustainability Analysis Using an Integrated Coastal Zone Management Approach for the Coastal Region of Ba Ria–Vung Tau Province, Vietnam", venue: "EnvironmentAsia", details: "17(2), 50–63 · Scopus Q4", type: "International journal", link: "https://doi.org/10.14456/ea.2024.20" },
    { year: 2024, authors: "Le, C.T., Nguyen, T.H., Tran, L.T.D., **Tran, M.T.**", title: "Applying multi-criteria analysis tools (AHP, SAW) combined with GIS to analyse the reasonableness of mineral resource exploitation in Phu My town, Ba Ria–Vung Tau province", venue: "VNUHCM Journal of Environment and Earth Sciences (Science & Technology Development Journal)", details: "8(2), 896–906 · Open access (CC BY 4.0)", type: "National journal", link: "assets/docs/2024_STDJSEE_Le-et-al_MCDA-GIS-Phu-My.pdf", linkType: "pdf" },
    { year: 2023, authors: "Le, C.T., Nguyen, P.V., Nguyen, Q.H., Tran, L.T.D., **Tran, M.T.**", title: "A Framework for Assessing Environmental Incidents in Coastal Areas: A Case Study in the Southeastern Coastal Area of Vietnam", venue: "Applied Environmental Research", details: "45(1), 002 · Scopus Q3", type: "International journal", link: "https://doi.org/10.35762/AER.2023002" },
    { year: 2023, authors: "Le, C.T., Nguyen, P.V., Nguyen, Q.H., Do, H.T.T., **Tran, M.T.**", title: "Environmental Sensitivity of Coastal Areas to Water Environmental Incidents: A Case Study in the Southeastern Coastal Region of Vietnam", venue: "International Journal of Environmental Science and Development", details: "14(3), 170–179 · Scopus Q3", type: "International journal", link: "https://doi.org/10.18178/ijesd.2023.14.3.1430" },
    { year: 2021, authors: "**Tran, M.T.**, Nguyen, H.T., Lam, V.G., Ho, H.L., Vo, T.D.H., Tran, T.", title: "Green technologies for air pollution treatment by microalgae in tubular photobioreactor", venue: "IOP Conference Series: Earth and Environmental Science", details: "926, 012098 · ICoGEE 2021", type: "International conference", link: "https://doi.org/10.1088/1755-1315/926/1/012098" },
    { year: 2021, authors: "Tran, T., Nguyen, H.T., **Tran, M.T.**, Nguyen, Q.A., Nguyen, D.A.K., Lam, V.G.", title: "Establishment and testing of a microalgae-based air treatment system using tubular photobioreactor technology", venue: "Natural Resources and Environment (Tạp chí Tài nguyên & Môi trường)", details: "8(358), 80–81", type: "National journal", link: "" }
  ],

  /* ---------------------------------------------------------------------
     ITEMS — selected projects, research and activities.
     category: "project" | "research" | "activity"
     period: [startYear, endYear] — places the pin on the timeline road and
             sorts the lists (newest first)
     featured: true → shown on the home page
     Add a new object here and it appears on its list page + gets a detail page.
     --------------------------------------------------------------------- */
  items: [
    /* ============================ PROJECTS ============================ */
    {
      id: "ai-training",
      category: "project",
      type: "AI training",
      title: "AI Training Contributor — Data Annotation & Evaluation",
      subtitle: "Outlier · remote, part-time alongside the PhD",
      date: "09/2026 – Present",
      period: [2026, 2026],
      location: "Remote",
      role: "Annotator & Evaluator",
      organization: "Outlier",
      summary: "Transcribe and verify speech data for speech recognition, and evaluate AI-generated audio and multimodal outputs against detailed rubrics. All work follows strict project guidelines without AI-tool assistance.",
      description: [
        "Alongside my PhD, I work part-time and remotely as an AI training contributor.",
        "Tasks cover verbatim speech transcription for ASR datasets, verification of machine-generated transcripts and timestamps, and pairwise evaluation of AI-generated speech and multimodal artifacts.",
        "Every task follows detailed, frequently updated guidelines and QA rubrics, completed independently and without AI-tool assistance."
      ],
      highlights: [
        "Speech transcription for ASR: verbatim text with filler, false-start and non-verbal tags",
        "Transcript verification: corrected text, segment timestamps (within ~0.2 s) and language labels",
        "Text-to-speech pairwise evaluation on quality, naturalness, speaker similarity and pronunciation",
        "Multimodal output evaluation: rubric-based comparison of AI-built websites, games and reports"
      ],
      tags: ["AI training", "Data annotation", "Speech data", "Evaluation"],
      cover: "assets/img/project-ai-training-1.svg",
      gallery: [{ src: "assets/img/project-ai-training-1.svg", alt: "Illustration of audio annotation and rubric-based evaluation of AI outputs" }],
      links: [],
      featured: true
    },
    {
      id: "water-quality-hcmc",
      category: "project",
      type: "Consultancy",
      title: "Water Quality Management Plan for Rivers and Lakes in Ho Chi Minh City, to 2030",
      subtitle: "Surface water quality, pollution load and carrying capacity",
      date: "2024 – 2026",
      period: [2024, 2026],
      location: "Ho Chi Minh City, Vietnam",
      role: "Lead Consultant & Project Coordinator",
      organization: "Department of Agriculture and Environment of Ho Chi Minh City",
      summary: "Assessed surface water quality across 39 rivers and 17 lakes for a city-wide management plan to 2030. Coordinated delivery and the carrying-capacity and discharge-zoning analysis.",
      description: [
        "Ho Chi Minh City needed a plan to manage the quality of its rivers and lakes through 2030.",
        "I prepared the bid for this assignment: the technical proposal (solution, methodology and work plan), the financial proposal (cost estimate and proposed contract value), and the capability profile, key-expert CVs, team organisation and relevant experience.",
        "I coordinated project delivery and the implementation framework, and took part in field surveys of water bodies and of point and non-point pollution sources.",
        "The team assessed pollution loads and environmental carrying capacity, then proposed discharge zoning, an emission-reduction roadmap and mitigation measures, delivered as technical reports and stakeholder presentations."
      ],
      highlights: [
        "Field surveys and surface water quality assessment across 39 rivers and 17 lakes",
        "Pollution load and environmental carrying capacity assessment of water bodies",
        "Discharge zoning, emission-reduction roadmap and pollution mitigation measures",
        "Field and laboratory data processed in Excel and checked against national technical regulations",
        "Technical reports and presentations for government stakeholders",
        "Bid preparation: technical proposal (solution and methodology) and financial proposal"
      ],
      tags: ["Water quality", "Carrying capacity", "Field survey", "Coordination", "Bidding"],
      cover: "assets/img/project-water-quality-hcmc-1.jpg",
      gallery: gallery("project-water-quality-hcmc", [
        "Urban canal surveyed for surface water quality",
        "Shaded creek at a survey point",
        "Stream channel with water pipes crossing overhead",
        "Stream flowing under a road bridge",
        "Water samples collected for laboratory analysis",
        "Creek with eroded banks in a rural area",
        "Small creek channel through farmland",
        "Port area surveyed as a point pollution source",
        "Wastewater treatment basin at a point source",
        "Treatment unit inspected during the point-source survey",
        "Covered treatment tanks at a discharge source",
        "Rice paper drying at a craft village surveyed as a non-point source",
        "Rice fields surveyed as an agricultural non-point source",
        "Greenhouse farming area surveyed as a non-point source",
        "Map of the surface water monitoring network"
      ]),
      links: [],
      featured: true
    },
    {
      id: "compliance-eia",
      category: "project",
      type: "Compliance",
      title: "EIA, Permitting, Bidding & Technical Reporting",
      subtitle: "Regulatory work for government-commissioned projects",
      date: "2021 – Present",
      period: [2021, 2026],
      location: "Vietnam",
      role: "Field Surveyor & Report Author",
      organization: "Institute for Environment and Resources (IER), VNU-HCM",
      summary: "Conducted EIA studies, prepared environmental permit documentation and bid documents for government-commissioned projects. Presented technical findings to government agencies and clients.",
      description: [
        "Alongside research projects, my work at IER includes regulatory documentation for government-commissioned projects across Vietnam.",
        "I carry out field surveys and write EIA reports on water, air and general environmental conditions, and prepare wastewater discharge and other environmental permit applications.",
        "I also take part in bidding: finding tenders that match the institute's capabilities, planning bid preparation, and preparing bid documents — capability profiles, key-expert CVs, team organisation and relevant experience, and above all the technical proposal (solution and methodology) and the financial proposal.",
        "I also review students' drafts and analyses, and present findings to government agencies as regulator-ready recommendations."
      ],
      highlights: [
        "EIA studies of water, air and environmental conditions, as field surveyor and report author",
        "Wastewater discharge permit applications and other environmental permit documents",
        "Tender search and bid planning matched to the institute's capabilities",
        "Bid documents: capability profile, key-expert CVs, technical proposal (solution & methodology) and financial proposal",
        "PowerPoint presentations for government agencies and clients",
        "Written review and corrections of undergraduate and graduate researchers' drafts"
      ],
      tags: ["EIA", "Permitting", "Bidding", "Reporting"],
      cover: "assets/img/project-compliance-eia-1.svg",
      gallery: [{ src: "assets/img/project-compliance-eia-1.svg", alt: "Illustration of an EIA report with water and air sampling" }],
      links: [],
      featured: false
    },
    {
      id: "green-book-2024",
      category: "project",
      type: "Environmental assessment",
      title: "Green Book Assessment Programme 2024, Binh Duong Province",
      subtitle: "Surveying enterprises for environmental compliance and green development",
      date: "2024",
      period: [2024, 2024],
      location: "Binh Duong, Vietnam",
      role: "Team Member · Enterprise Surveys",
      organization: "Department of Natural Resources and Environment (DONRE), Binh Duong",
      summary: "Surveyed enterprises for environmental compliance and green, clean and beautiful development practices in Binh Duong's Green Book programme. In 2024, 35 enterprises were recognised.",
      description: [
        "Binh Duong's Green Book recognises enterprises that comply with environmental rules and develop in a green, clean and beautiful way.",
        "As a team member, I was responsible for surveying participating enterprises on site, checking their environmental compliance and green development practices, including wastewater treatment, air emission control and waste storage.",
        "In 2024, more than 130 enterprises registered, 70 passed the preliminary round and 35 were recognised."
      ],
      highlights: [
        "On-site surveys of enterprises' environmental compliance",
        "Review of wastewater treatment, air emission control and waste storage systems",
        "Assessment of green, clean and beautiful development practices",
        "Programme scale: 130+ registered enterprises, 70 shortlisted, 35 recognised"
      ],
      tags: ["Environmental compliance", "Site survey", "Green development"],
      cover: "assets/img/project-green-book-2024-1.jpg",
      gallery: gallery("project-green-book-2024", [
        "Wastewater treatment tanks at a surveyed facility",
        "Aeration basin of a wastewater treatment plant",
        "Treatment unit with pipework",
        "Treatment pond at an industrial site",
        "Air emission treatment column",
        "Waste sorting bins in a storage room",
        "Dust collection system",
        "Wastewater treatment tank with access stairs",
        "Exhaust gas scrubber",
        "Air handling and exhaust units"
      ]),
      links: [
        { label: "Binh Duong announces the 2024 Green Book (VnExpress, in Vietnamese)", url: "https://vnexpress.net/binh-duong-cong-bo-sach-xanh-2024-4830134.html", icon: "newspaper" }
      ],
      featured: true
    },
    {
      id: "green-book-2022",
      category: "project",
      type: "Environmental assessment",
      title: "Green Book Assessment Programme 2022, Binh Duong Province",
      subtitle: "Surveying enterprises for environmental compliance and green development",
      date: "2022",
      period: [2022, 2022],
      location: "Binh Duong, Vietnam",
      role: "Team Member · Enterprise Surveys",
      organization: "Department of Natural Resources and Environment (DONRE), Binh Duong",
      summary: "Surveyed enterprises for environmental compliance and green, clean and beautiful development practices in the 2022 Green Book round. 40 enterprises were recognised.",
      description: [
        "In the 2022 round of Binh Duong's Green Book programme, I was a team member responsible for surveying enterprises on site.",
        "Surveys checked environmental compliance and green, clean and beautiful development practices, including waste storage, emission control and drainage.",
        "The round ended with Decision 3213/QĐ-UBND (1 December 2022), recognising 40 enterprises."
      ],
      highlights: [
        "On-site surveys of enterprises' environmental compliance",
        "Review of hazardous and solid waste storage, emission control and drainage",
        "40 enterprises recognised under Decision 3213/QĐ-UBND"
      ],
      tags: ["Environmental compliance", "Site survey", "Green development"],
      cover: "assets/img/project-green-book-2022-1.jpg",
      gallery: gallery("project-green-book-2022", [
        "Air ventilation and emission control structure",
        "Hazardous waste storage room",
        "Drainage channel along a factory fence",
        "Fuel storage area inside a factory",
        "Storage tanks at a surveyed facility",
        "Drainage pit inspected during the survey",
        "Process equipment inside a factory",
        "Exhaust treatment equipment"
      ]),
      links: [],
      featured: false
    },
    {
      id: "monitoring-brvt",
      category: "project",
      type: "Consultancy",
      title: "Environmental Monitoring Program for Ba Ria–Vung Tau Province, 2021–2025",
      subtitle: "A 188-point province-wide monitoring network",
      date: "2021 – 2022",
      period: [2021, 2022],
      location: "Ba Ria–Vung Tau, Vietnam",
      role: "Lead Consultant",
      organization: "Department of Natural Resources and Environment (DONRE), Ba Ria–Vung Tau",
      summary: "Surveyed water, air, sediment, soil and aquatic ecology to design the province's 2021–2025 monitoring programme. Used multi-criteria analysis to site a 188-point network.",
      description: [
        "The province needed a monitoring programme for 2021–2025; IER delivered the final project report to DONRE Ba Ria–Vung Tau in July 2022.",
        "I prepared the bid for this assignment, including the technical approach and methodology, the financial proposal, and supporting documents: capability profile, key-expert CVs, team organisation and relevant experience.",
        "I took part in field surveys and assessed water, air, sediment, soil and microbiological quality, as well as aquatic ecological status using biodiversity indices.",
        "Multi-criteria analysis was used to design a 188-point network, with a written justification for every siting decision, followed by recommendations for its long-term operation."
      ],
      highlights: [
        "Field surveys of surface water, seawater, air, sediment, soil and aquatic ecology",
        "Aquatic ecological status assessed with biodiversity indices; species data analysed in Excel",
        "Multi-criteria analysis to design a 188-point monitoring network",
        "Written justification recorded for every siting decision",
        "Measures proposed for long-term operation and development of the network",
        "Bid preparation: technical approach, methodology and financial proposal"
      ],
      tags: ["Monitoring network", "Multi-criteria analysis", "Field survey", "Water & air quality", "Bidding"],
      cover: "assets/img/project-monitoring-brvt-1.jpg",
      gallery: gallery("project-monitoring-brvt", [
        "Water sample containers on a reservoir shore",
        "Stream at a surface water monitoring point",
        "Drainage channel at a monitoring point",
        "Rocky rapids at a river monitoring point",
        "Reservoir wetland at a monitoring point",
        "Reservoir intake structure",
        "Water sampling from a boat on a reservoir",
        "Ambient air monitoring station",
        "Flooded vegetation at a reservoir edge",
        "Wooden pier at a lake monitoring point",
        "Sandy beach at a seawater monitoring point",
        "Rocky shoreline at a coastal monitoring point",
        "Monitoring network map, Song Ray reservoir",
        "Monitoring network map, Da Den reservoir",
        "Province-wide monitoring network map for terrestrial environmental components"
      ]),
      links: [],
      featured: true
    },

    /* ============================ RESEARCH ============================ */
    {
      id: "sustainability-index-iczm",
      category: "research",
      type: "Research project",
      title: "Composite Sustainability Index for Coastal Development (ICZM Approach)",
      subtitle: "Coastal zone of Ho Chi Minh City (formerly Ba Ria–Vung Tau) · Project C2025-24-04",
      date: "2025 – 2026",
      period: [2025, 2026],
      location: "Ho Chi Minh City, Vietnam",
      role: "Principal Investigator",
      organization: "Funded by VNU-HCM (C2025-24-04)",
      summary: "Led a VNU-HCM funded study that built a 20-criterion coastal sustainability index on an ICZM framework and mapped 14 coastal communes with GBWM, GIS and remote sensing. Published as first author in Applied Environmental Research (2027).",
      description: [
        "The coast of Ho Chi Minh City faces rapid urbanisation, mangrove loss, erosion and sea-level rise, yet sustainability is usually assessed one sector at a time.",
        "As principal investigator, I led the project from proposal to final report. We built a 2019–2025 coastal dataset and designed an index of 20 criteria in three dimensions (7 socio-economic, 8 eco-environmental, 5 institutional-management), structured on ICZM principles. A panel of 12 experts selected the criteria and weighted them with the Group Best–Worst Method (GBWM) over two consultation rounds.",
        "Spatial criteria came from satellite imagery: inundation from Sentinel-1 radar, shoreline materials from Sentinel-2, shoreline change 2015–2025 from Landsat 8/9 and forest cover from Landsat 9, each validated against 400 field and Google Earth samples (Kappa 0.87–0.95). A survey of 104 managers, businesses and households scored the communication criterion.",
        "The index ranged from 0.378 to 0.630 across 14 coastal communes. Low scores were linked to mangrove loss, shoreline retreat and limited management capacity, and the eco-environmental dimension carried the largest weight (49%). Combining the results with a SWOT analysis, we proposed three groups of solutions: policy and management, research and technology transfer, and community communication."
      ],
      highlights: [
        "Principal investigator, from proposal to final report",
        "20 criteria in 3 ICZM dimensions, weighted by a 12-expert panel (GBWM)",
        "Sentinel-1/2 and Landsat 8/9 criteria, validated with 400 samples each (Kappa 0.87–0.95)",
        "Sociological survey of 104 respondents",
        "Sustainability maps for 14 coastal communes; priority areas identified",
        "First-author article: Applied Environmental Research (2027)"
      ],
      tags: ["ICZM", "Composite index", "GBWM", "GIS", "Remote sensing", "Sustainability"],
      cover: "assets/img/research-sustainability-index-iczm-1.jpg",
      gallery: gallery("research-sustainability-index-iczm", [
        "Coastal sustainability index map for the 14 coastal communes of Ho Chi Minh City (AER 2027, Fig. 7)",
        "Methodology framework: ICZM criteria, GBWM weighting, data processing and spatial zoning (AER 2027, Fig. 2)",
        "Study area: coastal communes of Ho Chi Minh City (AER 2027, Fig. 1)",
        "Socio-economic, eco-environmental and institutional-management index maps (AER 2027, Fig. 4)",
        "Optimal criteria weights and deviation ranges from GBWM (AER 2027, Fig. 3)",
        "Contribution of each component index to the sustainability index by commune (AER 2027, Fig. 6)",
        "Shoreline change rates 2015–2025 from Landsat imagery",
        "Environmental-protection message board on the coast of Binh Chau (field survey)"
      ]),
      links: [
        { label: "Applied Environmental Research (2027) — DOI", url: "https://doi.org/10.35762/AER.2027002", icon: "file-text" }
      ],
      featured: true
    },
    {
      id: "vulnerability-coastal-tourism",
      category: "research",
      type: "Research project",
      title: "Composite Vulnerability Index for Coastal Tourism under Socio-Economic Development and Climate Change",
      subtitle: "Ba Ria–Vung Tau Province · Project C2024-24-04",
      date: "2024 – 2025",
      period: [2024, 2025],
      location: "Ba Ria–Vung Tau, Vietnam",
      role: "Key Researcher",
      organization: "Funded by VNU-HCM (C2024-24-04)",
      summary: "Developed a composite vulnerability index for coastal tourism and mapped 23 sub-regions with MCDA, GIS and remote sensing. Published as first author in IJESD (2025).",
      description: [
        "Coastal tourism areas are under pressure from rapid development and climate change.",
        "I helped build the assessment framework and a vulnerability index from sensitivity and adaptability sub-indices, using field surveys at tourism sites, in-depth interviews, remote sensing and GIS.",
        "The 23 sub-regions fell into four levels (21.74% low, 34.78% moderate, 30.43% high, 13.04% very high), and three solutions were proposed for the most vulnerable areas."
      ],
      highlights: [
        "Field surveys at major coastal tourism sites",
        "Composite tourism vulnerability index from sensitivity and adaptability sub-indices",
        "MCDA (AHP, SAW) and PCA to weight, score and rank criteria",
        "Vulnerability maps for 23 coastal sub-regions",
        "First-author article in IJESD (2025); further article in JSSM (2026, in press)"
      ],
      tags: ["Vulnerability", "MCDA", "GIS", "Coastal tourism"],
      cover: "assets/img/research-vulnerability-coastal-tourism-1.jpg",
      gallery: gallery("research-vulnerability-coastal-tourism", [
        "Field survey at Bai Sau beach, Vung Tau",
        "Methodology framework (IJESD 2025, Fig. 2)",
        "Field survey at Dinh Co, Long Hai",
        "Field survey at a seafront park in Vung Tau",
        "Field survey at a coastal resort development, Ho Tram",
        "Field survey at the Minh Dam historical site",
        "Field trip stop during the coastal tourism survey",
        "Study area location map",
        "Map of the sensitivity sub-index",
        "Map of the adaptability sub-index",
        "Map of coastal tourism vulnerability levels"
      ]),
      links: [
        { label: "IJESD (2025) — DOI", url: "https://doi.org/10.18178/ijesd.2025.16.5.1544", icon: "file-text" }
      ],
      featured: true
    },
    {
      id: "chemical-spill-risk",
      category: "research",
      type: "Research project",
      title: "Environmental Risk Assessment Framework for Onshore Chemical Spill Incidents in Coastal Areas",
      subtitle: "Ba Ria–Vung Tau Province · Project C2021-24-05",
      date: "2021 – 2023",
      period: [2021, 2023],
      location: "Ba Ria–Vung Tau, Vietnam",
      role: "Supporting Researcher",
      organization: "Funded by VNU-HCM (C2021-24-05)",
      summary: "Built a step-by-step framework to assess coastal risk from onshore chemical spills, with forecast-based risk maps for rainy and dry seasons. Results appeared in AER and IJESD (2023).",
      description: [
        "Coastal areas face a high potential for chemical spills that can threaten livelihoods and ecosystems.",
        "I conducted field surveys, forecast-based risk assessments and risk mapping within a framework combining hazard, exposure and vulnerability factors.",
        "In the published case study, 27 sub-regions were classed into four incident levels for each season, and prevention and mitigation measures were proposed."
      ],
      highlights: [
        "Field surveys in coastal areas exposed to chemical spill risk",
        "Risk framework built on hazard, exposure, sensitivity and adaptability",
        "Seasonal risk maps (rainy and dry) produced with GIS and remote sensing",
        "Prevention and mitigation measures for high-risk sub-regions",
        "Co-author of two articles: AER (2023) and IJESD (2023)"
      ],
      tags: ["Environmental risk", "MCDM", "GIS", "Coastal incidents"],
      cover: "assets/img/research-chemical-spill-risk-1.jpg",
      gallery: gallery("research-chemical-spill-risk", [
        "Layered assessment model linking hazard, exposure and vulnerability data",
        "Research framework for assessing environmental incidents",
        "Study area with 27 coastal sub-regions",
        "Environmental risk map, rainy season",
        "Environmental risk map, dry season",
        "Panel of environmental incident zoning maps"
      ]),
      links: [
        { label: "Applied Environmental Research (2023) — DOI", url: "https://doi.org/10.35762/AER.2023002", icon: "file-text" },
        { label: "IJESD (2023) — DOI", url: "https://doi.org/10.18178/ijesd.2023.14.3.1430", icon: "file-text" }
      ],
      featured: true
    },
    {
      id: "microalgae-photobioreactor",
      category: "research",
      type: "Thesis research",
      title: "Microalgae-Based Air Pollution Treatment in a Tubular Photobioreactor",
      subtitle: "Bachelor's thesis · HCMUT",
      date: "2021",
      period: [2021, 2021],
      location: "Ho Chi Minh City, Vietnam",
      role: "First Author · Bachelor's Thesis",
      organization: "Ho Chi Minh City University of Technology (HCMUT)",
      summary: "Built and tested a tubular photobioreactor in which microalgae absorb CO₂ from motorcycle exhaust. Presented at ICoGEE 2021 and published in IOP Conference Series.",
      description: [
        "Motorcycle exhaust is a major source of air pollution, and microalgae can use CO₂ to grow.",
        "For my bachelor's thesis, I helped design and test a tubular photobioreactor that grows Chlorella vulgaris on exhaust from a mini motorcycle engine.",
        "The microalgae grew stably to 6×10⁶ cells/ml after 42 days, and the system absorbed 26.59% of CO₂ emissions after 11 days."
      ],
      highlights: [
        "Designed and built a tubular photobioreactor test system",
        "Stable Chlorella vulgaris growth: 6×10⁶ cells/ml after 42 days",
        "CO₂ absorption efficiency of 26.59% after 11 days",
        "First-author paper in IOP Conf. Series: Earth and Environmental Science (2021)"
      ],
      tags: ["Air pollution", "Microalgae", "Green technology"],
      cover: "assets/img/research-microalgae-photobioreactor-1.jpg",
      gallery: gallery("research-microalgae-photobioreactor", [
        "Completed tubular photobioreactor system",
        "Schematic of the photobioreactor",
        "Microalgae growth curve under exhaust gas conditions",
        "Input and output CO₂ concentrations and removal efficiency",
        "Microalgae culture used in the study",
        "Microscope view of microalgae at low density",
        "Microscope view of microalgae at high density"
      ]),
      links: [
        { label: "IOP Conf. Series (2021) — DOI", url: "https://doi.org/10.1088/1755-1315/926/1/012098", icon: "file-text" }
      ],
      featured: false
    },

    /* =========================== ACTIVITIES =========================== */
    {
      id: "unssc-undrr-course",
      category: "activity",
      type: "Training",
      title: "Disaster Risk Reduction & Climate Change Adaptation Course",
      subtitle: "UNSSC & UNDRR · online course",
      date: "September 2026",
      period: [2026, 2026],
      location: "Online",
      role: "Participant",
      organization: "UN System Staff College (UNSSC) & UN Office for Disaster Risk Reduction (UNDRR)",
      summary: "Completed Module 1 of the Synergizing Disaster Risk Reduction and Climate Action Learning Path. The module covers coherence between disaster risk reduction and climate change adaptation.",
      description: [
        "To build on my coastal risk research, I completed Module 1 of the UNSSC and UNDRR Synergizing Disaster Risk Reduction and Climate Action Learning Path.",
        "The two-hour module, Promoting Coherence between Disaster Risk Reduction and Climate Change Adaptation, was completed on 14 September 2026."
      ],
      highlights: [
        "Certificate of completion issued 14 September 2026",
        "Topic: coherence between disaster risk reduction and climate change adaptation"
      ],
      tags: ["Training", "Climate adaptation", "Disaster risk"],
      cover: "assets/img/activity-unssc-undrr-course-1.jpg",
      gallery: gallery("activity-unssc-undrr-course", ["UNSSC and UNDRR certificate of completion"]),
      links: [],
      featured: false
    },
    {
      id: "phd-chula",
      category: "activity",
      type: "Milestone",
      title: "Starting My PhD at Chulalongkorn University",
      subtitle: "International Program in Hazardous Substance and Environmental Management",
      date: "2025 – Present",
      period: [2025, 2026],
      location: "Bangkok, Thailand",
      role: "PhD Candidate",
      organization: "Chulalongkorn University · Graduate School",
      summary: "Began doctoral research in Bangkok on a fully funded Chulalongkorn University Graduate Scholarship. My research looks at coastal risk, vulnerability and nature-based solutions under climate change.",
      description: [
        "In 2025 I moved to Bangkok to start a PhD in the English-medium International Program in Hazardous Substance and Environmental Management at Chulalongkorn University, supported by a fully funded Graduate Scholarship (2025–2028).",
        "My research focuses on coastal risk and vulnerability assessment, climate change, and nature-based solutions under future sea-level rise and land-use change scenarios.",
        "Alongside my studies, I continue working with IER, VNU-HCM, coordinating projects remotely from Bangkok."
      ],
      highlights: [
        "Chulalongkorn University Graduate Scholarship, fully funded (2025–2028)",
        "International, English-medium doctoral program",
        "Vietnamese Young Scientific Researcher in Thailand Award (2026)"
      ],
      tags: ["Education", "PhD", "Thailand"],
      cover: "assets/img/activity-phd-chula-1.jpg",
      gallery: gallery("activity-phd-chula", [
        "At the Center of Excellence on Hazardous Substance Management, home of the international PhD program",
        "HSM Research Laboratory",
        "First days in Bangkok and at Chulalongkorn University",
        "With PhD classmates",
        "Exploring a temple in Bangkok"
      ]),
      links: [],
      featured: true
    },
    {
      id: "vsat-2026",
      category: "activity",
      type: "Award",
      title: "Vietnamese Young Scientific Researcher in Thailand Award 2026",
      subtitle: "Vietnamese Students' Association in Thailand",
      date: "May 2026",
      period: [2026, 2026],
      location: "Bangkok, Thailand",
      role: "Awardee · Chulalongkorn University",
      organization: "Vietnamese Students' Association in Thailand",
      summary: "Recognised as a Vietnamese Young Scientific Researcher in Thailand in 2026 while pursuing my PhD at Chulalongkorn University.",
      description: [
        "The award recognises young Vietnamese researchers studying and working in Thailand.",
        "My application presented research applying multi-criteria analysis, GIS and remote sensing to assess vulnerability and environmental risk in coastal areas, together with my publication record.",
        "The award was conferred on 13 May 2026 in Bangkok."
      ],
      highlights: [
        "Award certificate issued in Bangkok on 13 May 2026",
        "Research presented: MCDA, GIS and remote sensing for coastal vulnerability and environmental risk",
        "Received during my PhD at Chulalongkorn University"
      ],
      tags: ["Award", "Research"],
      cover: "assets/img/activity-vsat-2026-1.jpg",
      gallery: gallery("activity-vsat-2026", [
        "Award announcement for the Young Scientific Researcher in Thailand 2026",
        "Award certificate from the Vietnamese Students' Association in Thailand"
      ]),
      links: [],
      featured: true
    },
    {
      id: "graduation-master",
      category: "activity",
      type: "Milestone",
      title: "Master of Engineering Graduation, GPA 4.0/4.0",
      subtitle: "Faculty of Environment and Natural Resources, HCMUT",
      date: "November 2024",
      period: [2024, 2024],
      location: "Ho Chi Minh City, Vietnam",
      role: "Graduate",
      organization: "Ho Chi Minh City University of Technology (HCMUT), VNU-HCM",
      summary: "Graduated with a Master of Engineering in Natural Resources and Environmental Management with a GPA of 4.0/4.0. Thesis on MCDA and GIS for coastal vulnerability to tourism.",
      description: [
        "I completed my Master of Engineering in Natural Resources and Environmental Management at HCMUT with a GPA of 4.0/4.0.",
        "My thesis applied multi-criteria decision analysis and GIS to assess coastal vulnerability to tourism development in Ba Ria–Vung Tau province."
      ],
      highlights: [
        "GPA 4.0/4.0",
        "Thesis: MCDA and GIS for coastal vulnerability to tourism in Ba Ria–Vung Tau",
        "Postgraduate scholarships from HCMUT (2022) and the Taiwan Businessmen's Scholarship Fund (2023)"
      ],
      tags: ["Graduation", "Education"],
      cover: "assets/img/activity-graduation-master-1.jpg",
      gallery: gallery("activity-graduation-master", [
        "Receiving the Master's degree on stage",
        "Celebrating the Master's graduation together on campus",
        "Graduation ceremony of the Faculty of Environment and Natural Resources"
      ]),
      links: [],
      featured: false
    },
    {
      id: "graduation-bachelor",
      category: "activity",
      type: "Award",
      title: "Valedictorian & Gold Medal, Bachelor of Engineering",
      subtitle: "Ho Chi Minh City University of Technology (HCMUT)",
      date: "2022",
      period: [2022, 2022],
      location: "Ho Chi Minh City, Vietnam",
      role: "Valedictorian",
      organization: "Ho Chi Minh City University of Technology (HCMUT), VNU-HCM",
      summary: "Graduated as valedictorian of the Resources and Environmental Management programme and received the Gold Medal. Studies completed in 2021; awarded at the 2022 ceremony.",
      description: [
        "I completed my Bachelor of Engineering in Resources and Environmental Management in 2021 with a GPA of 3.5/4.0.",
        "At the 2022 graduation ceremony, I was recognised as valedictorian and received the Gold Medal, after earning the Academic Merit Scholarship in 7 of 8 semesters."
      ],
      highlights: [
        "Valedictorian and Gold Medal",
        "Academic Merit Scholarship in 7 of 8 semesters",
        "\"5-Good Student\" Award at HCMUT and VNU-HCM levels (2022)",
        "Followed by the HCMUT Postgraduate Scholarship for Valedictorian Graduates"
      ],
      tags: ["Award", "Education"],
      cover: "assets/img/activity-graduation-bachelor-1.jpg",
      gallery: gallery("activity-graduation-bachelor", [
        "Holding the valedictorian trophy, medal and certificate",
        "Celebrating graduation day together",
        "Graduation day with the valedictorian trophy",
        "Celebrating with the Gold Medal and trophy"
      ]),
      links: [],
      featured: true
    },
    {
      id: "icogee-2021",
      category: "activity",
      type: "Conference",
      title: "Presenter at ICoGEE 2021",
      subtitle: "3rd International Conference on Green Energy and Environment",
      date: "2021",
      period: [2021, 2021],
      location: "Bangka Belitung, Indonesia",
      role: "Presenter & First Author",
      organization: "3rd ICoGEE 2021",
      summary: "Presented my bachelor's research on microalgae-based air pollution treatment at an international conference. The paper was published in IOP Conference Series.",
      description: [
        "I presented my bachelor's thesis research on a tubular photobioreactor for microalgae-based air pollution treatment at the 3rd International Conference on Green Energy and Environment (ICoGEE 2021).",
        "The accompanying paper was published in IOP Conference Series: Earth and Environmental Science, volume 926."
      ],
      highlights: [
        "Oral presentation of first-author research",
        "Paper published in IOP Conf. Series: Earth and Environmental Science (926, 012098)"
      ],
      tags: ["Conference", "Presentation"],
      cover: "assets/img/activity-icogee-2021-1.jpg",
      gallery: gallery("activity-icogee-2021", [
        "Title slide of the ICoGEE 2021 presentation",
        "The completed photobioreactor shown in the presentation"
      ]),
      links: [
        { label: "Conference paper — DOI", url: "https://doi.org/10.1088/1755-1315/926/1/012098", icon: "file-text" }
      ],
      featured: false
    },
    {
      id: "covid-volunteer",
      category: "activity",
      type: "Volunteering",
      title: "Volunteer, COVID-19 Prevention Efforts",
      subtitle: "Ba Ria City Youth Union · Ho Chi Minh Communist Youth Union",
      date: "2021",
      period: [2021, 2021],
      location: "Ba Ria City, Vietnam",
      role: "Volunteer",
      organization: "Ho Chi Minh Communist Youth Union — Ba Ria City Youth Union",
      summary: "Supported COVID-19 prevention in Ba Ria City with the city Youth Union, entering vaccination data, organising vaccination flow and assisting doctors.",
      description: [
        "During the 2021 COVID-19 outbreak, I volunteered with the Ba Ria City Youth Union of the Ho Chi Minh Communist Youth Union.",
        "I entered vaccination data, helped organise the order and flow of people at vaccination sites, and assisted doctors with COVID-19 prevention work."
      ],
      highlights: [
        "Vaccination data entry",
        "Organising the vaccination queue and flow at vaccination sites",
        "Supporting doctors in COVID-19 prevention and control"
      ],
      tags: ["Volunteering", "Community"],
      cover: "assets/img/activity-covid-volunteer-1.jpg",
      gallery: gallery("activity-covid-volunteer", [
        "Volunteer team in protective suits",
        "Vaccination data entry desk",
        "Volunteers in protective equipment",
        "Volunteers in face shields and protective suits"
      ]),
      links: [],
      featured: true
    },
    {
      id: "smart-cities-2020",
      category: "activity",
      type: "Award",
      title: "Second Prize, Smart Cities Contest — National GIS Conference 2020",
      subtitle: "GIS for managing Ho Chi Minh City's waste collection network",
      date: "December 2020",
      period: [2020, 2020],
      location: "Ho Chi Minh City, Vietnam",
      role: "Team Member · All Stars team",
      organization: "National GIS Conference 2020, hosted by HCMUT",
      summary: "Our team won Second Prize with a proposal to manage Ho Chi Minh City's waste collection network with GIS and GPS. The contest was part of the National GIS Conference 2020 at HCMUT.",
      description: [
        "The National GIS Conference 2020, themed GIS for Smart Cities Towards Sustainable Development, was hosted by HCMUT on 2 December 2020.",
        "Our team proposed a GIS/GPS model to manage collection vehicles and fixed waste bins, plan collection routes and reduce overflowing bins and illegal dumping sites.",
        "The All Stars team received the Second Place Award in the Smart Cities Contest."
      ],
      highlights: [
        "GIS/GPS tracking of waste collection vehicles and fixed bins",
        "Shortest collection routes to treatment sites",
        "Bin-fill alerts via sensors and waste statistics by area",
        "Second Place Award, Smart Cities Contest (2 December 2020)"
      ],
      tags: ["Award", "GIS", "Smart city"],
      cover: "assets/img/activity-smart-cities-2020-1.jpg",
      gallery: gallery("activity-smart-cities-2020", [
        "Certificate of Achievement, Second Place, Smart Cities Contest 2020",
        "Title slide: applying GIS to manage Ho Chi Minh City's waste collection network",
        "Proposed GIS/GPS solution for waste collection",
        "GIS data layers and expected results"
      ]),
      links: [],
      featured: false
    }
  ]
};

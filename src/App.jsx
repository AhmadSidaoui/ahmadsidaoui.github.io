import React from 'react';
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  PanelsTopLeft,
  RadioTower,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const dashboards = [
  {
    title: 'EcoTrack Dashboard',
    eyebrow: 'ESG reporting',
    summary:
      'A Power BI experience for consolidating recycling streams, tracking progress, and turning fragmented ESG inputs into decision-ready reporting.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiNmE0ODZkMmQtYjIwMS00NjU1LThkNzQtNzBiY2EyM2E2NzNjIiwidCI6ImYzYjc2MjBlLTZiMjMtNDBlOS04N2Q5LWQ5ZjI2Y2E0ZmViOSIsImMiOjl9',
    icon: Sparkles
  },
  {
    title: 'Recommendation Dashboard',
    eyebrow: 'Production optimization',
    summary:
      'A monitoring and recommendation layer for comparing artificial lift performance, surfacing exceptions, and focusing engineers on the next best action.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiYTNkMWY0YzQtZmM3Zi00YTYxLWJiYTctODk2OTdhODFiODQxIiwidCI6ImYzYjc2MjBlLTZiMjMtNDBlOS04N2Q5LWQ5ZjI2Y2E0ZmViOSIsImMiOjl9',
    icon: TrendingUp
  },
  {
    title: 'ESP Advisory & Monitoring',
    eyebrow: 'Well performance',
    summary:
      'An ESP-focused analytics dashboard for surveillance, performance review, and operational visibility across production assets.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiODc2MmUxZGUtZTBmYy00OTlhLWI4NTgtZTQzNjc3YjA5ODY3IiwidCI6ImYzYjc2MjBlLTZiMjMtNDBlOS04N2Q5LWQ5ZjI2Y2E0ZmViOSIsImMiOjl9',
    icon: RadioTower
  }
];

const experience = [
  {
    role: 'Senior Professional Services Engineer',
    company: 'Weatherford',
    period: 'Jan 2025 - Mar 2026',
    points: [
      'Developed machine learning workflows for production forecasting, anomaly detection, and operational surveillance.',
      'Built Power BI and Spotfire dashboards for production monitoring and well performance analysis.',
      'Supported client workshops and demos as an analytics subject matter expert.'
    ]
  },
  {
    role: 'Technical Consultant, Data Science & Production Analytics',
    company: 'Datagration / Myr:conn Solutions',
    period: 'Aug 2023 - Dec 2024',
    points: [
      'Designed analytics workflows for petroleum engineering, ESG reporting, and production optimization use cases.',
      'Integrated operational datasets into unified dashboards that improved visibility for engineering teams.',
      'Optimized machine learning pipelines for production forecasting and performance monitoring.'
    ]
  },
  {
    role: 'Research & Laboratory Roles',
    company: 'TU Wien / OMV',
    period: 'Feb 2021 - Jan 2023',
    points: [
      'Researched enhanced oil recovery topics with a focus on chemical solution optimization and fluid-rock interactions.',
      'Analyzed experimental data supporting petroleum engineering studies.'
    ]
  }
];

const skills = [
  'Python',
  'SQL',
  'Machine Learning',
  'Production Analytics',
  'ETL / ELT',
  'Airflow',
  'Docker',
  'Power BI',
  'Spotfire',
  'Tableau',
  'SCADA workflows',
  'Time-series data'
];

const metrics = [
  { value: '25%', label: 'faster project turnaround through analytics workflows' },
  { value: '15%', label: 'model accuracy lift through ML pipeline optimization' },
  { value: '3', label: 'Power BI dashboard products highlighted here' }
];

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Ahmad Sidaoui home">
        AS
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#dashboards">Dashboards</a>
        <a href="#experience">Experience</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="header-action" href="CV Ahmad Sidaoui.pdf" download>
        <Download size={18} />
        CV
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero section" id="top">
      <div className="hero-copy">
        <div className="profile-lockup">
          <img className="profile-photo" src="/Picture.png" alt="Ahmad Sidaoui" />
          <div>
            <div className="eyebrow">
              <MapPin size={16} />
              Vienna, Austria - Open to relocation
            </div>
            <p className="profile-title">Data Scientist · Production Analytics · BI</p>
          </div>
        </div>
        <h1>Ahmad Sidaoui</h1>
        <p className="hero-lede">
          Data scientist and production analytics specialist building machine learning systems,
          operational dashboards, and decision tools for engineering teams.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#dashboards">
            <PanelsTopLeft size={18} />
            View dashboards
          </a>
          <a className="button secondary" href="CV Ahmad Sidaoui.pdf" download>
            <Download size={18} />
            Download CV
          </a>
        </div>
      </div>

      <div className="insight-panel" aria-label="Portfolio summary">
        <div className="panel-top">
          <span>Production analytics cockpit</span>
          <BarChart3 size={20} />
        </div>
        <div className="signal-grid">
          <div className="signal tall">
            <Database size={22} />
            <strong>ETL</strong>
            <span>Operational data pipelines</span>
          </div>
          <div className="signal">
            <TrendingUp size={22} />
            <strong>ML</strong>
            <span>Forecasting and anomaly detection</span>
          </div>
          <div className="signal">
            <PanelsTopLeft size={22} />
            <strong>BI</strong>
            <span>Power BI, Spotfire, Tableau</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="metrics" aria-label="Impact metrics">
      {metrics.map((metric) => (
        <div className="metric" key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </div>
      ))}
    </section>
  );
}

function About() {
  return (
    <section className="section split-section" id="about">
      <div>
        <p className="section-kicker">About</p>
        <h2>Turning complex production data into usable engineering intelligence.</h2>
      </div>
      <div className="text-stack">
        <p>
          I work at the intersection of data science, production analytics, and dashboard
          engineering. My focus is practical: convert fragmented operational data into clear
          models, workflows, and visual products that help teams act faster.
        </p>
        <p>
          Across oil and gas, ESG reporting, and client-facing analytics projects, I have built
          forecasting tools, anomaly detection workflows, SCADA-informed dashboards, and BI systems
          that connect technical depth with business impact.
        </p>
      </div>
    </section>
  );
}

function Dashboards() {
  return (
    <section className="section dashboards-section" id="dashboards">
      <div className="section-heading">
        <p className="section-kicker">Power BI portfolio</p>
        <h2>Live dashboards with real analytical surface area.</h2>
        <p>
          These reports are kept as the main project showcase, replacing the old web dashboard and
          map pages with a focused portfolio experience.
        </p>
      </div>

      <div className="dashboard-list">
        {dashboards.map((dashboard) => {
          const Icon = dashboard.icon;
          return (
            <article className="dashboard-card" key={dashboard.title}>
              <div className="dashboard-copy">
                <div className="dashboard-eyebrow">
                  <Icon size={18} />
                  {dashboard.eyebrow}
                </div>
                <h3>{dashboard.title}</h3>
                <p>{dashboard.summary}</p>
                <a className="text-link" href={dashboard.src} target="_blank" rel="noreferrer">
                  Open in Power BI
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <div className="dashboard-frame-wrap">
                <iframe
                  title={dashboard.title}
                  src={dashboard.src}
                  className="dashboard-frame"
                  allowFullScreen
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="section" id="experience">
      <div className="section-heading compact">
        <p className="section-kicker">Experience</p>
        <h2>Analytics work built close to the operation.</h2>
      </div>
      <div className="timeline">
        {experience.map((item) => (
          <article className="timeline-item" key={`${item.company}-${item.period}`}>
            <div className="timeline-date">{item.period}</div>
            <div className="timeline-content">
              <h3>{item.role}</h3>
              <p className="company">
                <BriefcaseBusiness size={17} />
                {item.company}
              </p>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={17} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="section skills-section" id="skills">
      <div className="section-heading compact">
        <p className="section-kicker">Skills</p>
        <h2>Data stack, domain context, and dashboard delivery.</h2>
      </div>
      <div className="skill-grid">
        {skills.map((skill) => (
          <span className="skill-pill" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

function Publications() {
  return (
    <section className="section publication-section">
      <div className="section-heading compact">
        <p className="section-kicker">Publications</p>
        <h2>Work shared with the technical community.</h2>
      </div>
      <div className="publication-grid">
        <article>
          <span>ADIPEC Conference, 2024</span>
          <h3>Machine Learning Driven Problem Detection for Production Optimization</h3>
        </article>
        <article>
          <span>SPE Artificial Lift Conference and Exhibition, 2024</span>
          <h3>Physics-Informed Reinforcement Learning for Motor Frequency Optimization</h3>
        </article>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section contact-section" id="contact">
      <div>
        <p className="section-kicker">Contact</p>
        <h2>Let’s build clearer analytics for complex operations.</h2>
      </div>
      <div className="contact-actions">
        <a className="button primary" href="mailto:ahmadsidoaui@gmail.com">
          <Mail size={18} />
          Email Ahmad
        </a>
        <a className="button secondary" href="https://www.linkedin.com/in/ahmad-sidaoui-a1586513a" target="_blank" rel="noreferrer">
          <Linkedin size={18} />
          LinkedIn
        </a>
        <a className="button secondary" href="https://github.com/AhmadSidaoui" target="_blank" rel="noreferrer">
          <Github size={18} />
          GitHub
        </a>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Metrics />
        <About />
        <Dashboards />
        <Experience />
        <Skills />
        <Publications />
        <Contact />
      </main>
      <footer className="footer">© {new Date().getFullYear()} Ahmad Sidaoui. Built with React.</footer>
    </>
  );
}

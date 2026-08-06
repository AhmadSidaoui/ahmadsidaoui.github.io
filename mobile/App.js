import React, { useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
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
  TrendingUp,
  X
} from 'lucide-react-native';

import { colors } from './src/theme';
import { CV_URL, contact, dashboards, experience, metrics, publications, skills } from './src/data';

const DASHBOARD_ICONS = { Sparkles, TrendingUp, RadioTower };

const NAV_ITEMS = [
  { key: 'about', label: 'About' },
  { key: 'dashboards', label: 'Dashboards' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'contact', label: 'Contact' }
];

function openUrl(url) {
  Linking.openURL(url).catch(() => {});
}

function Header({ onNavigate }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Text style={styles.brandText}>AS</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll}>
        {NAV_ITEMS.map((item) => (
          <Pressable key={item.key} onPress={() => onNavigate(item.key)} style={styles.navLink}>
            <Text style={styles.navLinkText}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={styles.headerAction} onPress={() => openUrl(CV_URL)}>
        <Download size={16} color={colors.ink} />
        <Text style={styles.headerActionText}>CV</Text>
      </Pressable>
    </View>
  );
}

function Hero({ onNavigate }) {
  return (
    <View style={[styles.section, styles.hero]}>
      <View style={styles.profileLockup}>
        <Image source={require('./assets/profile.png')} style={styles.profilePhoto} />
        <View style={styles.flexShrink}>
          <View style={styles.eyebrowRow}>
            <MapPin size={15} color={colors.accent} />
            <Text style={styles.eyebrowText}>Vienna, Austria - Open to relocation</Text>
          </View>
          <Text style={styles.profileTitle}>Data Scientist · Production Analytics · BI</Text>
        </View>
      </View>

      <Text style={styles.h1}>Ahmad Sidaoui</Text>
      <Text style={styles.lede}>
        Data scientist and production analytics specialist building machine learning systems,
        operational dashboards, and decision tools for engineering teams.
      </Text>

      <View style={styles.heroActions}>
        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={() => onNavigate('dashboards')}>
          <PanelsTopLeft size={17} color="#fff" />
          <Text style={styles.buttonPrimaryText}>View dashboards</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => openUrl(CV_URL)}>
          <Download size={17} color={colors.ink} />
          <Text style={styles.buttonSecondaryText}>Download CV</Text>
        </Pressable>
      </View>

      <View style={styles.insightPanel}>
        <View style={styles.panelTop}>
          <Text style={styles.panelTopText}>Production analytics cockpit</Text>
          <BarChart3 size={18} color={colors.muted} />
        </View>
        <View style={styles.signalGrid}>
          <View style={[styles.signal, styles.signalTall]}>
            <Database size={20} color="#fff" />
            <Text style={styles.signalStrongLight}>ETL</Text>
            <Text style={styles.signalSpanLight}>Operational data pipelines</Text>
          </View>
          <View style={styles.signalRowGroup}>
            <View style={styles.signal}>
              <TrendingUp size={20} color={colors.ink} />
              <Text style={styles.signalStrong}>ML</Text>
              <Text style={styles.signalSpan}>Forecasting and anomaly detection</Text>
            </View>
            <View style={styles.signal}>
              <PanelsTopLeft size={20} color={colors.ink} />
              <Text style={styles.signalStrong}>BI</Text>
              <Text style={styles.signalSpan}>Power BI, Spotfire, Tableau</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Metrics() {
  return (
    <View style={styles.metrics}>
      {metrics.map((metric, index) => (
        <View
          key={metric.label}
          style={[styles.metric, index !== metrics.length - 1 && styles.metricDivider]}
        >
          <Text style={styles.metricValue}>{metric.value}</Text>
          <Text style={styles.metricLabel}>{metric.label}</Text>
        </View>
      ))}
    </View>
  );
}

function About() {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>About</Text>
      <Text style={styles.h2}>Turning complex production data into usable engineering intelligence.</Text>
      <Text style={styles.paragraph}>
        I work at the intersection of data science, production analytics, and dashboard
        engineering. My focus is practical: convert fragmented operational data into clear
        models, workflows, and visual products that help teams act faster.
      </Text>
      <Text style={styles.paragraph}>
        Across oil and gas, ESG reporting, and client-facing analytics projects, I have built
        forecasting tools, anomaly detection workflows, SCADA-informed dashboards, and BI systems
        that connect technical depth with business impact.
      </Text>
    </View>
  );
}

function Dashboards({ onOpen }) {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>Power BI portfolio</Text>
      <Text style={styles.h2}>Live dashboards with real analytical surface area.</Text>
      <Text style={styles.paragraph}>
        These reports are kept as the main project showcase, replacing the old web dashboard and
        map pages with a focused portfolio experience.
      </Text>

      <View style={styles.dashboardList}>
        {dashboards.map((dashboard) => {
          const Icon = DASHBOARD_ICONS[dashboard.icon];
          return (
            <View style={styles.dashboardCard} key={dashboard.title}>
              <View style={styles.dashboardEyebrowRow}>
                <Icon size={16} color={colors.accent} />
                <Text style={styles.dashboardEyebrowText}>{dashboard.eyebrow}</Text>
              </View>
              <Text style={styles.h3}>{dashboard.title}</Text>
              <Text style={styles.paragraph}>{dashboard.summary}</Text>
              <Pressable style={styles.textLinkRow} onPress={() => onOpen(dashboard)}>
                <Text style={styles.textLink}>Open dashboard</Text>
                <ArrowUpRight size={16} color={colors.accentStrong} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Experience() {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>Experience</Text>
      <Text style={styles.h2}>Analytics work built close to the operation.</Text>
      <View style={styles.timeline}>
        {experience.map((item) => (
          <View style={styles.timelineItem} key={`${item.company}-${item.period}`}>
            <Text style={styles.timelineDate}>{item.period}</Text>
            <Text style={styles.h3}>{item.role}</Text>
            <View style={styles.companyRow}>
              <BriefcaseBusiness size={15} color={colors.muted} />
              <Text style={styles.companyText}>{item.company}</Text>
            </View>
            {item.points.map((point) => (
              <View style={styles.timelinePointRow} key={point}>
                <CheckCircle2 size={15} color={colors.accent} />
                <Text style={styles.timelinePointText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function Skills() {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>Skills</Text>
      <Text style={styles.h2}>Data stack, domain context, and dashboard delivery.</Text>
      <View style={styles.skillGrid}>
        {skills.map((skill) => (
          <View style={styles.skillPill} key={skill}>
            <Text style={styles.skillPillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Publications() {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>Publications</Text>
      <Text style={styles.h2}>Work shared with the technical community.</Text>
      <View style={styles.publicationGrid}>
        {publications.map((pub) => (
          <View style={styles.publicationCard} key={pub.title}>
            <Text style={styles.publicationVenue}>{pub.venue}</Text>
            <Text style={styles.h3}>{pub.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Contact() {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>Contact</Text>
      <Text style={styles.h2}>Let’s build clearer analytics for complex operations.</Text>
      <View style={styles.contactActions}>
        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={() => openUrl(contact.email)}>
          <Mail size={17} color="#fff" />
          <Text style={styles.buttonPrimaryText}>Email Ahmad</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => openUrl(contact.linkedin)}>
          <Linkedin size={17} color={colors.ink} />
          <Text style={styles.buttonSecondaryText}>LinkedIn</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => openUrl(contact.github)}>
          <Github size={17} color={colors.ink} />
          <Text style={styles.buttonSecondaryText}>GitHub</Text>
        </Pressable>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} Ahmad Sidaoui. Built with React Native.</Text>
    </View>
  );
}

function DashboardModal({ dashboard, onClose }) {
  return (
    <Modal visible={!!dashboard} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle} numberOfLines={1}>
          {dashboard?.title}
        </Text>
        <View style={styles.modalActions}>
          <Pressable style={styles.modalIconButton} onPress={() => dashboard && openUrl(dashboard.src)}>
            <ArrowUpRight size={20} color={colors.ink} />
          </Pressable>
          <Pressable style={styles.modalIconButton} onPress={onClose}>
            <X size={20} color={colors.ink} />
          </Pressable>
        </View>
      </View>
      {dashboard ? <WebView source={{ uri: dashboard.src }} style={styles.webview} /> : null}
    </Modal>
  );
}

export default function App() {
  const scrollRef = useRef(null);
  const offsets = useRef({});
  const [activeDashboard, setActiveDashboard] = useState(null);

  function registerOffset(key, y) {
    offsets.current[key] = y;
  }

  function handleNavigate(key) {
    const y = offsets.current[key] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
  }

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <Header onNavigate={handleNavigate} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        <Hero onNavigate={handleNavigate} />
        <Metrics />
        <View onLayout={(e) => registerOffset('about', e.nativeEvent.layout.y)}>
          <About />
        </View>
        <View onLayout={(e) => registerOffset('dashboards', e.nativeEvent.layout.y)}>
          <Dashboards onOpen={setActiveDashboard} />
        </View>
        <View onLayout={(e) => registerOffset('experience', e.nativeEvent.layout.y)}>
          <Experience />
        </View>
        <View onLayout={(e) => registerOffset('skills', e.nativeEvent.layout.y)}>
          <Skills />
        </View>
        <Publications />
        <View onLayout={(e) => registerOffset('contact', e.nativeEvent.layout.y)}>
          <Contact />
        </View>
      </ScrollView>
      <DashboardModal dashboard={activeDashboard} onClose={() => setActiveDashboard(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  scrollContent: {
    paddingBottom: 48
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  brand: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandText: { color: '#fff', fontWeight: '800' },
  navScroll: { flex: 1 },
  navLink: { paddingHorizontal: 10, paddingVertical: 6 },
  navLinkText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surface
  },
  headerActionText: { color: colors.ink, fontWeight: '700', fontSize: 13 },

  section: { paddingHorizontal: 20, paddingVertical: 32 },
  hero: { paddingTop: 24 },

  profileLockup: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  profilePhoto: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: colors.surfaceMuted
  },
  flexShrink: { flexShrink: 1 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrowText: { color: colors.accent, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  profileTitle: { color: colors.muted, fontWeight: '700', fontSize: 14 },

  h1: { color: colors.ink, fontSize: 40, fontWeight: '800', lineHeight: 42, marginBottom: 12 },
  h2: { color: colors.ink, fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 10 },
  h3: { color: colors.ink, fontSize: 17, fontWeight: '700', marginBottom: 8 },
  lede: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: 20 },
  paragraph: { color: colors.muted, fontSize: 15, lineHeight: 23, marginBottom: 12 },
  kicker: { color: colors.accent, fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  buttonSecondaryText: { color: colors.ink, fontWeight: '700' },

  insightPanel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 16
  },
  panelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  panelTopText: { color: colors.muted, fontWeight: '800' },
  signalGrid: { flexDirection: 'row', gap: 10 },
  signal: {
    flex: 1,
    minHeight: 96,
    justifyContent: 'flex-end',
    gap: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.82)',
    marginBottom: 10
  },
  signalTall: {
    flex: 0,
    width: '38%',
    minHeight: 202,
    backgroundColor: colors.ink,
    marginBottom: 0
  },
  signalRowGroup: { flex: 1, gap: 10 },
  signalStrong: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  signalStrongLight: { color: '#fff', fontSize: 20, fontWeight: '800' },
  signalSpan: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  signalSpanLight: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 },

  metrics: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.line
  },
  metric: { flex: 1, backgroundColor: colors.surface, padding: 14 },
  metricDivider: { borderRightWidth: 1, borderRightColor: colors.line },
  metricValue: { color: colors.gold, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  metricLabel: { color: colors.muted, fontSize: 12, lineHeight: 16 },

  dashboardList: { gap: 16, marginTop: 8 },
  dashboardCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 16
  },
  dashboardEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dashboardEyebrowText: { color: colors.accent, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  textLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  textLink: { color: colors.accentStrong, fontWeight: '700' },

  timeline: { gap: 12, marginTop: 8 },
  timelineItem: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
    padding: 14
  },
  timelineDate: { color: colors.accentStrong, fontWeight: '800', marginBottom: 6 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  companyText: { color: colors.muted, fontWeight: '700' },
  timelinePointRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  timelinePointText: { flex: 1, color: colors.muted, fontSize: 14, lineHeight: 20 },

  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  skillPill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  skillPillText: { color: colors.ink, fontWeight: '700', fontSize: 13 },

  publicationGrid: { gap: 12, marginTop: 8 },
  publicationCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 14
  },
  publicationVenue: { color: colors.gold, fontWeight: '800', fontSize: 12, marginBottom: 6 },

  contactActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 24 },
  footer: { color: colors.muted, fontSize: 13 },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg
  },
  modalTitle: { flex: 1, color: colors.ink, fontWeight: '800', fontSize: 16, marginRight: 12 },
  modalActions: { flexDirection: 'row', gap: 8 },
  modalIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  webview: { flex: 1 }
});

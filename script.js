/*
 * Generador de Informe ASG/ESG
 * © 2026 Yel Martínez — https://yel-martinez-portfolio.com
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Software libre, sin garantía de ningún tipo. Licencia: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Herramienta independiente y orientativa; no es oficial ni sustituye asesoramiento profesional.
 */
/**
 * Generador de Informe ASG/ESG para PYMEs
 * Scoped under ASGESG namespace to avoid global conflicts.
 * Genera el documento .docx enteramente en el navegador (JSZip) — sin backend,
 * sin llamadas de red salientes, sin dato de usuario almacenado en ningun servidor.
 */
(function() {
"use strict";

var $wrap = document.getElementById('asgesg-wrap');
if (!$wrap) return;

// ===================== NAVIGATION =====================
var sections = ['dashboard','organizacion','empleados','diversidad','proveedores','clientes','medioambiente','etica','generar'];

function navigate(id) {
  sections.forEach(function(s) {
    var sec = document.getElementById('section-' + s);
    var nav = document.getElementById('nav-' + s);
    if (sec) sec.classList.remove('active');
    if (nav) nav.classList.remove('active');
  });
  var sec = document.getElementById('section-' + id);
  var nav = document.getElementById('nav-' + id);
  if (sec) sec.classList.add('active');
  if (nav) nav.classList.add('active');
  $wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function togglePill(el) {
  el.classList.toggle('checked');
  saveAndProgress();
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function countFilled(ids) {
  return ids.filter(function(id) { return getVal(id) !== ''; }).length;
}

function updateProgress(module, ids) {
  var filled = countFilled(ids);
  var pct = Math.round((filled / ids.length) * 100);
  var fill = document.getElementById('fill-' + module);
  var pctEl = document.getElementById('pct-' + module);
  var prog = document.getElementById('prog-' + module);
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (prog) {
    prog.textContent = pct + '%';
    prog.classList.toggle('zero', pct === 0);
  }
  return pct;
}

function saveAndProgress() {
  var p = {
    organizacion: updateProgress('organizacion', ['org_nombre','org_sector','org_actividades','org_sede','org_empleados_total']),
    empleados: updateProgress('empleados', ['emp_gestion','m_emp_actual','m_cont_actual','m_rot_actual','m_abs_actual','m_rem_actual']),
    diversidad: updateProgress('diversidad', ['div_mujeres','div_mujeres_dir','div_brecha','div_iniciativas']),
    proveedores: updateProgress('proveedores', ['prov_politica','m_prov_amb_a','m_prov_soc_a']),
    clientes: updateProgress('clientes', ['cli_salud','m_cli_sal_a','m_cli_dat_a']),
    medioambiente: updateProgress('medioambiente', ['amb_politica','m_amb_ene_a','m_amb_co1_a','m_amb_co2_a','m_amb_res_a']),
    etica: updateProgress('etica', ['eti_anticorrupcion','m_eti_cor_a','m_eti_fis_a']),
  };

  var vals = Object.keys(p).map(function(k) { return p[k]; });
  var global = Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length);
  var kpiPct = document.getElementById('kpi-pct');
  if (kpiPct) kpiPct.textContent = global + '%';

  var initiated = vals.filter(function(v) { return v > 0; }).length;
  var kpiSections = document.getElementById('kpi-sections');
  if (kpiSections) kpiSections.textContent = initiated + '/7';

  var allMetricIds = ['m_emp_actual','m_cont_actual','m_rot_actual','m_abs_actual','m_rem_actual','m_acc_actual',
    'm_prov_amb_a','m_prov_soc_a','m_prov_loc_a','m_cli_sal_a','m_cli_etq_a','m_cli_dat_a',
    'm_amb_ene_a','m_amb_ren_a','m_amb_agu_a','m_amb_co1_a','m_amb_co2_a','m_amb_res_a','m_amb_rec_a','m_amb_san_a',
    'm_eti_cor_a','m_eti_fis_a','m_eti_lit_a'];
  var kpiMetrics = document.getElementById('kpi-metrics');
  if (kpiMetrics) kpiMetrics.textContent = countFilled(allMetricIds);
}

// ===================== DOC TYPE / LANG SELECTION =====================
var selectedDocType = 'reporte';
var selectedDocLang = 'es';

function selectDocType(type) {
  selectedDocType = type;
  ['reporte','medioambiental','conducta'].forEach(function(t) {
    var el = document.getElementById('dtype-' + t);
    if (el) el.classList.remove('selected');
  });
  var sel = document.getElementById('dtype-' + type);
  if (sel) sel.classList.add('selected');
}

function selectDocLang(lang) {
  selectedDocLang = lang;
  ['es','ca','en'].forEach(function(l) {
    var el = document.getElementById('dlang-' + l);
    if (el) el.classList.toggle('active', l === lang);
  });
}

function showToast(msg) {
  var t = document.getElementById('asgesg-toast');
  var m = document.getElementById('asgesg-toast-msg');
  if (!t || !m) return;
  m.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}

// ===================== FIELD COLLECTION =====================
var FIELD_IDS = [
  'org_nombre','org_sector','org_cif','org_anyo','org_actividades',
  'org_sede','org_empleados_total','org_paises',
  'emp_gestion','emp_objetivos',
  'm_emp_actual','m_emp_ant1','m_emp_ant2',
  'm_cont_actual','m_cont_ant1','m_cont_ant2',
  'm_rot_actual','m_rot_ant1','m_rot_ant2',
  'm_abs_actual','m_abs_ant1','m_abs_ant2',
  'm_rem_actual','m_rem_ant1','m_rem_ant2',
  'm_acc_actual','m_acc_ant1','m_acc_ant2',
  'div_mujeres','div_mujeres_dir','div_jovenes','div_mayores',
  'div_pcd','div_brecha','div_discrim','div_iniciativas',
  'prov_politica',
  'm_prov_amb_a','m_prov_amb_b','m_prov_amb_c',
  'm_prov_soc_a','m_prov_soc_b','m_prov_soc_c',
  'm_prov_loc_a','m_prov_loc_b','m_prov_loc_c',
  'cli_salud',
  'm_cli_sal_a','m_cli_sal_b','m_cli_sal_c',
  'm_cli_etq_a','m_cli_etq_b','m_cli_etq_c',
  'm_cli_dat_a','m_cli_dat_b','m_cli_dat_c',
  'amb_politica','amb_objetivos',
  'm_amb_ene_a','m_amb_ene_b','m_amb_ene_c',
  'm_amb_ren_a','m_amb_ren_b','m_amb_ren_c',
  'm_amb_agu_a','m_amb_agu_b','m_amb_agu_c',
  'm_amb_co1_a','m_amb_co1_b','m_amb_co1_c',
  'm_amb_co2_a','m_amb_co2_b','m_amb_co2_c',
  'm_amb_res_a','m_amb_res_b','m_amb_res_c',
  'm_amb_rec_a','m_amb_rec_b','m_amb_rec_c',
  'm_amb_san_a','m_amb_san_b','m_amb_san_c',
  'eti_anticorrupcion',
  'm_eti_cor_a','m_eti_cor_b','m_eti_cor_c',
  'm_eti_fis_a','m_eti_fis_b','m_eti_fis_c',
  'm_eti_lit_a','m_eti_lit_b','m_eti_lit_c',
];

function collectFields() {
  var asuntos = Array.prototype.slice.call(document.querySelectorAll('#asuntos-group .checkbox-pill.checked'))
    .map(function(el) { return el.dataset.value; }).join(', ');
  var fields = { org_asuntos: asuntos };
  FIELD_IDS.forEach(function(id) { fields[id] = getVal(id); });
  return fields;
}

// ===================== DOCX i18n (ported 1:1 from generate-esg-docx.php) =====================
var DOC_STRINGS = {
  "es": {
    "report_title": "INFORME DE SOSTENIBILIDAD ASG",
    "report_subtitle": "Ejercicio",
    "report_framework": "Elaborado conforme a los Estándares GRI 2021 · Agenda 2030 ODS · CSRD (UE 2022/2464)",
    "letter_heading": "1. Carta de la Dirección",
    "letter_p1": "En %s tenemos el convencimiento de que una gestión responsable y sostenible es el camino para responder a los compromisos adquiridos con nuestros grupos de interés. Este informe refleja nuestro desempeño ambiental, social y de gobernanza (ASG) durante el ejercicio %s.",
    "letter_p2": "El informe ha sido elaborado conforme a los Estándares GRI 2021 y tiene en cuenta los principios de la Agenda 2030 de Desarrollo Sostenible y el Pacto Mundial de Naciones Unidas.",
    "org_heading": "2. Información de la Organización",
    "activities_heading": "Actividades, marcas, productos y servicios",
    "location_heading": "Localización",
    "hq_label": "Sede principal: ",
    "countries_label": "Países de operación: ",
    "employees_label": "Número total de empleados: ",
    "material_heading": "3. Principales Asuntos Materiales",
    "material_body": "La organización ha identificado sus principales asuntos materiales en función de su sector de actividad y los impactos detectados en su cadena de valor.",
    "social_heading": "4. Desempeño Social (S)",
    "labour_heading": "Estándares Laborales",
    "labour_body": "La organización vela por unas condiciones laborales adecuadas para toda su plantilla.",
    "objectives_heading": "Objetivos del período",
    "dei_heading": "Diversidad e Inclusión",
    "suppliers_heading": "Proveedores",
    "suppliers_body": "La organización aplica criterios sociales y ambientales en la selección y evaluación de proveedores.",
    "customers_heading": "Clientes",
    "env_heading": "5. Desempeño Ambiental (E)",
    "env_body": "La organización está comprometida con la gestión responsable de sus impactos ambientales.",
    "env_obj_heading": "Objetivos ambientales",
    "gov_heading": "6. Gobernanza y Ética (G)",
    "gov_body": "La organización mantiene un firme compromiso con la ética empresarial y la prevención de la corrupción.",
    "about_heading": "7. Sobre este Informe",
    "about_p1": "Este informe de sostenibilidad ha sido elaborado conforme a los Estándares GRI (Global Reporting Initiative) 2021, considerando los principios para la elaboración de informes de sostenibilidad.",
    "about_p2": "La publicación se realiza de forma anual y comprende el período del 1 de enero al 31 de diciembre de %s, con alcance a las operaciones de %s%s.",
    "hq_of": " con sede en ",
    "watermark": "Elaborado con la plataforma ESG Reporting Tool · yel martinez portfolio · yelmartinez.com",
    "tbl_indicator": "Indicador",
    "tbl_gri": "GRI",
    "met_emp": "Nº total de empleados",
    "met_hire": "Nuevas contrataciones",
    "met_turn": "Rotación de plantilla (%)",
    "met_abs": "Absentismo (días/empleado)",
    "met_sal": "Remuneración media (€/año)",
    "met_acc": "Accidentes laborales",
    "met_women": "% Mujeres en plantilla",
    "met_women_mgmt": "% Mujeres en dirección",
    "met_pcd": "% Personas con discapacidad",
    "met_pay_gap": "Ratio salarial mujer/hombre",
    "met_discrim": "Casos de discriminación",
    "met_sup_env": "Proveedores evaluados (ambiental)",
    "met_sup_soc": "Proveedores evaluados (social)",
    "met_sup_local": "% Compras locales",
    "met_cli_health": "Incumplimientos salud/seguridad",
    "met_cli_label": "Incumplimientos etiquetado",
    "met_cli_data": "Reclamaciones datos personales",
    "met_energy": "Consumo energético (MWh)",
    "met_renew": "% Energía renovable",
    "met_water": "Consumo de agua (m³)",
    "met_scope1": "Emisiones Alcance 1 (t CO₂e)",
    "met_scope2": "Emisiones Alcance 2 (t CO₂e)",
    "met_waste": "Residuos generados (t)",
    "met_recycled": "% Residuos reciclados",
    "met_env_pen": "Sanciones ambientales",
    "met_corrupt": "Casos de corrupción confirmados",
    "met_tax": "Sanciones fiscales",
    "met_compet": "Litigios anticompetencia",
    "pol_title": "POLÍTICA MEDIOAMBIENTAL",
    "pol_scope_heading": "Alcance y Ámbito de Aplicación",
    "pol_scope_body": "La Política Medioambiental se aplica a todas las actividades de %s con independencia de su naturaleza y del lugar donde se desarrollen. Es aplicable a todos los empleados/as de la organización y demás grupos de interés vinculados a la entidad.",
    "pol_commit_heading": "Compromisos Medioambientales",
    "pol_specific_heading": "Compromisos específicos de la organización",
    "pol_obj_heading": "Objetivos ambientales del período",
    "pol_review_heading": "Seguimiento y Revisión",
    "pol_review_body": "Para su correcta implantación, %s cuenta con un comité de seguimiento que velará por su correcto cumplimiento y evaluará de forma periódica el cumplimiento de los objetivos establecidos. El documento será accesible a todos los empleados/as y grupos de interés.",
    "cod_title": "CÓDIGO DE CONDUCTA",
    "cod_object_heading": "1. Objeto del Código",
    "cod_object_body": "Este Código de Conducta define el estándar de comportamiento que %s pretende observar en toda su actividad y refleja el compromiso de la organización con los principios y valores que se exponen. Ha sido autorizado por el máximo órgano de administración y es un compromiso a máximo nivel.",
    "cod_scope_heading": "2. Ámbito de Aplicación",
    "cod_scope_body": "El Código de Conducta va dirigido a los/as directivos/as y empleados/as de %s, así como a todas las personas que actúen en nombre y representación de la organización.",
    "cod_principles_heading": "3. Principios y Valores",
    "cod_channel_heading": "4. Canal de Comunicación",
    "cod_channel_body": "Cualquier persona que detecte un incumplimiento del presente código podrá comunicarlo a través de los canales habilitados por la organización, garantizándose la confidencialidad y protección frente a represalias.",
    "cod_review_heading": "5. Revisión y Actualización",
    "cod_review_body": "El presente Código de Conducta será revisado periódicamente para adaptarlo a los cambios normativos, organizativos y del entorno. Cualquier modificación requerirá la aprobación del órgano de administración.",
    "prin_legal": "Cumplimiento de la legalidad",
    "prin_legal_body": "El primer compromiso de %s es cumplir siempre la legalidad aplicable en los países en que opera. La organización está comprometida con la persecución del blanqueo de capitales y actúa siempre de acuerdo con la normativa vigente.",
    "prin_data": "Protección de la información",
    "prin_data_body": "%s asume el compromiso de proteger la información confidencial y los datos de carácter personal, cumpliendo la legislación aplicable en materia de protección de datos (RGPD y LOPDGDD).",
    "prin_integrity": "Integridad y transparencia",
    "prin_integrity_body": "Los/as destinatarios/as del código actuarán con transparencia y no utilizarán la información de la organización para obtener ventajas económicas o personales. %s prohíbe toda práctica de corrupción, soborno o pago de facilitación en todas sus formas.",
    "prin_people": "Respeto a las personas y los derechos humanos",
    "prin_people_body": "La organización se compromete a respetar y promover los derechos humanos en todas sus actividades, garantizando un entorno laboral libre de discriminación, acoso o cualquier forma de violencia.",
    "prin_env": "Protección del medio ambiente",
    "prin_env_body": "Los/as destinatarios/as del código adoptarán conductas respetuosas con el medioambiente y apoyarán los compromisos ambientales de la organización, en línea con los ODS de la Agenda 2030 y el Pacto Mundial.",
    "anti_heading": "Medidas anticorrupción específicas",
    "year_label": "2026"
  },
  "ca": {
    "report_title": "INFORME DE SOSTENIBILITAT ASG",
    "report_subtitle": "Exercici",
    "report_framework": "Elaborat conforme als Estàndards GRI 2021 · Agenda 2030 ODS · CSRD (UE 2022/2464)",
    "letter_heading": "1. Carta de la Direcció",
    "letter_p1": "A %s tenim el convenciment que una gestió responsable i sostenible és el camí per respondre als compromisos adquirits amb els nostres grups d'interès. Aquest informe reflecteix el nostre rendiment ambiental, social i de governança (ASG) durant l'exercici %s.",
    "letter_p2": "L'informe ha estat elaborat conforme als Estàndards GRI 2021 i té en compte els principis de l'Agenda 2030 de Desenvolupament Sostenible i el Pacte Mundial de Nacions Unides.",
    "org_heading": "2. Informació de l'Organització",
    "activities_heading": "Activitats, marques, productes i serveis",
    "location_heading": "Localització",
    "hq_label": "Seu principal: ",
    "countries_label": "Països d'operació: ",
    "employees_label": "Nombre total d'empleats: ",
    "material_heading": "3. Principals Assumptes Materials",
    "material_body": "L'organització ha identificat els seus principals assumptes materials en funció del seu sector d'activitat i els impactes detectats a la seua cadena de valor.",
    "social_heading": "4. Rendiment Social (S)",
    "labour_heading": "Estàndards Laborals",
    "labour_body": "L'organització vetlla per unes condicions laborals adequades per a tota la seua plantilla.",
    "objectives_heading": "Objectius del període",
    "dei_heading": "Diversitat i Inclusió",
    "suppliers_heading": "Proveïdors",
    "suppliers_body": "L'organització aplica criteris socials i ambientals en la selecció i avaluació de proveïdors.",
    "customers_heading": "Clients",
    "env_heading": "5. Rendiment Ambiental (E)",
    "env_body": "L'organització està compromesa amb la gestió responsable dels seus impactes ambientals.",
    "env_obj_heading": "Objectius ambientals",
    "gov_heading": "6. Governança i Ètica (G)",
    "gov_body": "L'organització manté un ferm compromís amb l'ètica empresarial i la prevenció de la corrupció.",
    "about_heading": "7. Sobre aquest Informe",
    "about_p1": "Aquest informe de sostenibilitat ha estat elaborat conforme als Estàndards GRI (Global Reporting Initiative) 2021, considerant els principis per a l'elaboració d'informes de sostenibilitat.",
    "about_p2": "La publicació es realitza de forma anual i comprèn el període de l'1 de gener al 31 de desembre de %s, amb abast a les operacions de %s%s.",
    "hq_of": " amb seu a ",
    "watermark": "Elaborat amb la plataforma ESG Reporting Tool · yel martinez portfolio · yelmartinez.com",
    "tbl_indicator": "Indicador",
    "tbl_gri": "GRI",
    "met_emp": "Nº total d'empleats",
    "met_hire": "Noves contractacions",
    "met_turn": "Rotació de plantilla (%)",
    "met_abs": "Absentisme (dies/empleat)",
    "met_sal": "Remuneració mitjana (€/any)",
    "met_acc": "Accidents laborals",
    "met_women": "% Dones en plantilla",
    "met_women_mgmt": "% Dones en direcció",
    "met_pcd": "% Persones amb discapacitat",
    "met_pay_gap": "Ràtio salarial dona/home",
    "met_discrim": "Casos de discriminació",
    "met_sup_env": "Proveïdors avaluats (ambiental)",
    "met_sup_soc": "Proveïdors avaluats (social)",
    "met_sup_local": "% Compres locals",
    "met_cli_health": "Incompliments salut/seguretat",
    "met_cli_label": "Incompliments etiquetatge",
    "met_cli_data": "Reclamacions dades personals",
    "met_energy": "Consum energètic (MWh)",
    "met_renew": "% Energia renovable",
    "met_water": "Consum d'aigua (m³)",
    "met_scope1": "Emissions Abast 1 (t CO₂e)",
    "met_scope2": "Emissions Abast 2 (t CO₂e)",
    "met_waste": "Residus generats (t)",
    "met_recycled": "% Residus reciclats",
    "met_env_pen": "Sancions ambientals",
    "met_corrupt": "Casos de corrupció confirmats",
    "met_tax": "Sancions fiscals",
    "met_compet": "Litigis anticompetència",
    "pol_title": "POLÍTICA MEDIAMBIENTAL",
    "pol_scope_heading": "Abast i Àmbit d'Aplicació",
    "pol_scope_body": "La Política Mediambiental s'aplica a totes les activitats de %s amb independència de la seua naturalesa i del lloc on es desenvolupen.",
    "pol_commit_heading": "Compromisos Mediambientals",
    "pol_specific_heading": "Compromisos específics de l'organització",
    "pol_obj_heading": "Objectius ambientals del període",
    "pol_review_heading": "Seguiment i Revisió",
    "pol_review_body": "Per a la seua correcta implantació, %s compta amb un comitè de seguiment que vetllarà pel seu correcte compliment.",
    "cod_title": "CODI DE CONDUCTA",
    "cod_object_heading": "1. Objecte del Codi",
    "cod_object_body": "Aquest Codi de Conducta defineix l'estàndard de comportament que %s pretén observar en tota la seua activitat.",
    "cod_scope_heading": "2. Àmbit d'Aplicació",
    "cod_scope_body": "El Codi de Conducta va dirigit als/les directius/ves i empleats/des de %s, així com a totes les persones que actuen en nom i representació de l'organització.",
    "cod_principles_heading": "3. Principis i Valors",
    "cod_channel_heading": "4. Canal de Comunicació",
    "cod_channel_body": "Qualsevol persona que detecte un incompliment d'aquest codi podrà comunicar-ho a través dels canals habilitats per l'organització, garantint-se la confidencialitat i protecció enfront de represàlies.",
    "cod_review_heading": "5. Revisió i Actualització",
    "cod_review_body": "El present Codi de Conducta serà revisat periòdicament per adaptar-lo als canvis normatius, organitzatius i de l'entorn.",
    "prin_legal": "Compliment de la legalitat",
    "prin_legal_body": "El primer compromís de %s és complir sempre la legalitat aplicable als països on opera.",
    "prin_data": "Protecció de la informació",
    "prin_data_body": "%s assumeix el compromís de protegir la informació confidencial i les dades de caràcter personal, complint la legislació aplicable en matèria de protecció de dades (RGPD).",
    "prin_integrity": "Integritat i transparència",
    "prin_integrity_body": "Els/les destinataris/àries del codi actuaran amb transparència. %s prohibeix tota pràctica de corrupció, suborn o pagament de facilitació en totes les seues formes.",
    "prin_people": "Respecte a les persones i els drets humans",
    "prin_people_body": "L'organització es compromet a respectar i promoure els drets humans en totes les seues activitats, garantint un entorn laboral lliure de discriminació i assetjament.",
    "prin_env": "Protecció del medi ambient",
    "prin_env_body": "Els/les destinataris/àries del codi adoptaran conductes respectuoses amb el medi ambient i recolzaran els compromisos ambientals de l'organització.",
    "anti_heading": "Mesures anticorrupció específiques",
    "year_label": "2026"
  },
  "en": {
    "report_title": "SUSTAINABILITY REPORT (ESG)",
    "report_subtitle": "Financial year",
    "report_framework": "Prepared in accordance with GRI Standards 2021 · SDGs 2030 Agenda · CSRD (EU 2022/2464)",
    "letter_heading": "1. Letter from Management",
    "letter_p1": "At %s we are convinced that responsible and sustainable management is the way to meet the commitments made to our stakeholders. This report reflects our environmental, social and governance (ESG) performance during the %s financial year.",
    "letter_p2": "The report has been prepared in accordance with GRI Standards 2021 and takes into account the principles of the 2030 Sustainable Development Agenda and the United Nations Global Compact.",
    "org_heading": "2. Organisational Information",
    "activities_heading": "Activities, brands, products and services",
    "location_heading": "Location",
    "hq_label": "Headquarters: ",
    "countries_label": "Countries of operation: ",
    "employees_label": "Total number of employees: ",
    "material_heading": "3. Key Material Topics",
    "material_body": "The organisation has identified its key material topics based on its sector of activity and the impacts detected in its value chain.",
    "social_heading": "4. Social Performance (S)",
    "labour_heading": "Labour Standards",
    "labour_body": "The organisation ensures appropriate working conditions for all its staff.",
    "objectives_heading": "Period objectives",
    "dei_heading": "Diversity & Inclusion",
    "suppliers_heading": "Suppliers",
    "suppliers_body": "The organisation applies social and environmental criteria in the selection and assessment of suppliers.",
    "customers_heading": "Customers",
    "env_heading": "5. Environmental Performance (E)",
    "env_body": "The organisation is committed to the responsible management of its environmental impacts.",
    "env_obj_heading": "Environmental objectives",
    "gov_heading": "6. Governance & Ethics (G)",
    "gov_body": "The organisation maintains a firm commitment to business ethics and anti-corruption.",
    "about_heading": "7. About this Report",
    "about_p1": "This sustainability report has been prepared in accordance with GRI Standards (Global Reporting Initiative) 2021, considering the principles for sustainability reporting.",
    "about_p2": "The report is published annually and covers the period from 1 January to 31 December %s, encompassing the operations of %s%s.",
    "hq_of": " headquartered in ",
    "watermark": "Generated with ESG Reporting Tool · yel martinez portfolio · yelmartinez.com",
    "tbl_indicator": "Indicator",
    "tbl_gri": "GRI",
    "met_emp": "Total employees",
    "met_hire": "New hires",
    "met_turn": "Staff turnover (%)",
    "met_abs": "Absenteeism (days/emp)",
    "met_sal": "Average salary (€/year)",
    "met_acc": "Workplace accidents",
    "met_women": "% Women in workforce",
    "met_women_mgmt": "% Women in management",
    "met_pcd": "% Employees with disabilities",
    "met_pay_gap": "Female/male salary ratio",
    "met_discrim": "Discrimination cases",
    "met_sup_env": "Suppliers assessed (env.)",
    "met_sup_soc": "Suppliers assessed (soc.)",
    "met_sup_local": "% Local purchasing",
    "met_cli_health": "Health/safety non-compliance",
    "met_cli_label": "Labelling non-compliance",
    "met_cli_data": "Personal data complaints",
    "met_energy": "Energy consumption (MWh)",
    "met_renew": "% Renewable energy",
    "met_water": "Water consumption (m³)",
    "met_scope1": "Scope 1 emissions (t CO₂e)",
    "met_scope2": "Scope 2 emissions (t CO₂e)",
    "met_waste": "Waste generated (t)",
    "met_recycled": "% Recycled waste",
    "met_env_pen": "Environmental penalties",
    "met_corrupt": "Confirmed corruption cases",
    "met_tax": "Tax penalties",
    "met_compet": "Anti-competitive litigation",
    "pol_title": "ENVIRONMENTAL POLICY",
    "pol_scope_heading": "Scope and Application",
    "pol_scope_body": "The Environmental Policy applies to all activities of %s regardless of their nature and location. It applies to all employees and stakeholders linked to the organisation.",
    "pol_commit_heading": "Environmental Commitments",
    "pol_specific_heading": "Organisation-specific commitments",
    "pol_obj_heading": "Environmental objectives for the period",
    "pol_review_heading": "Monitoring and Review",
    "pol_review_body": "For its correct implementation, %s has a monitoring committee that will oversee compliance and periodically evaluate the achievement of the established objectives.",
    "cod_title": "CODE OF CONDUCT",
    "cod_object_heading": "1. Purpose of the Code",
    "cod_object_body": "This Code of Conduct defines the standard of behaviour that %s intends to observe in all its activities and reflects the organisation's commitment to the principles and values set out herein.",
    "cod_scope_heading": "2. Scope of Application",
    "cod_scope_body": "The Code of Conduct is addressed to the directors and employees of %s, as well as all persons acting on behalf of the organisation.",
    "cod_principles_heading": "3. Principles and Values",
    "cod_channel_heading": "4. Communication Channel",
    "cod_channel_body": "Any person who detects a breach of this code may report it through the channels established by the organisation, with confidentiality and protection against reprisals guaranteed.",
    "cod_review_heading": "5. Review and Update",
    "cod_review_body": "This Code of Conduct will be periodically reviewed to adapt it to regulatory, organisational and environmental changes. Any modification will require approval by the governing body.",
    "prin_legal": "Legal compliance",
    "prin_legal_body": "%s's first commitment is to always comply with the applicable legislation in the countries where it operates. The organisation is committed to combating money laundering.",
    "prin_data": "Information protection",
    "prin_data_body": "%s is committed to protecting confidential information and personal data, in compliance with applicable data protection legislation (GDPR).",
    "prin_integrity": "Integrity and transparency",
    "prin_integrity_body": "Code recipients will act with transparency. %s prohibits all forms of corruption, bribery or facilitation payments.",
    "prin_people": "Respect for people and human rights",
    "prin_people_body": "The organisation is committed to respecting and promoting human rights in all its activities, ensuring a working environment free from discrimination, harassment or any form of violence.",
    "prin_env": "Environmental protection",
    "prin_env_body": "Code recipients will adopt environmentally responsible conduct and support the organisation's environmental commitments in line with the SDGs and the Global Compact.",
    "anti_heading": "Specific anti-corruption measures",
    "year_label": "2026"
  }
};

var ENV_COMMITMENTS = {
  "es": [
    "Velar por el cumplimiento de la legislación ambiental aplicable y otros compromisos voluntarios adquiridos.",
    "Desarrollar un Sistema de Gestión Ambiental que ayude a detectar los principales riesgos e impactos ambientales.",
    "Implantar un plan de eficiencia energética y uso racional de los recursos naturales.",
    "Aplicar principios y buenas prácticas ambientales en todas las actividades.",
    "Formar y sensibilizar a los grupos de interés para que actúen de forma sostenible.",
    "Promover el uso de tecnologías respetuosas con el medioambiente.",
    "Prevenir y mitigar las actuaciones que puedan tener un impacto ambiental negativo.",
    "Reducir la huella ambiental de la organización de forma progresiva.",
    "Incentivar la compra de productos sostenibles y energéticamente eficientes.",
    "Colaborar en proyectos e iniciativas de prevención ambiental.",
    "Establecer indicadores de seguimiento para medir los impactos ambientales.",
    "Integrar las resoluciones del Acuerdo de París y los ODS 6, 7, 12, 13, 14, 15 y 17.",
    "Aplicar los Principios 7, 8 y 9 del Pacto Mundial de Naciones Unidas sobre medioambiente.",
    "Comunicar y difundir la estrategia y política ambiental a todos los grupos de interés."
  ],
  "ca": [
    "Vetlar pel compliment de la legislació ambiental aplicable i altres compromisos voluntaris adquirits.",
    "Desenvolupar un Sistema de Gestió Ambiental que ajude a detectar els principals riscos i impactes ambientals.",
    "Implantar un pla d'eficiència energètica i ús racional dels recursos naturals.",
    "Aplicar principis i bones pràctiques ambientals en totes les activitats.",
    "Formar i sensibilitzar els grups d'interès perquè actuen de forma sostenible.",
    "Promoure l'ús de tecnologies respectuoses amb el medi ambient.",
    "Prevenir i mitigar les actuacions que puguen tenir un impacte ambiental negatiu.",
    "Reduir la petjada ambiental de l'organització de forma progressiva.",
    "Incentivar la compra de productes sostenibles i energèticament eficients.",
    "Col·laborar en projectes i iniciatives de prevenció ambiental.",
    "Establir indicadors de seguiment per mesurar els impactes ambientals.",
    "Integrar les resolucions de l'Acord de París i els ODS 6, 7, 12, 13, 14, 15 i 17.",
    "Aplicar els Principis 7, 8 i 9 del Pacte Mundial de Nacions Unides sobre medi ambient.",
    "Comunicar i difondre l'estratègia i política ambiental a tots els grups d'interès."
  ],
  "en": [
    "Ensure compliance with applicable environmental legislation and other voluntary commitments.",
    "Develop an Environmental Management System to detect key environmental risks and impacts.",
    "Implement an energy efficiency plan and rational use of natural resources.",
    "Apply environmental principles and best practices across all activities.",
    "Train and raise awareness among stakeholders to act sustainably.",
    "Promote the use of environmentally friendly technologies.",
    "Prevent and mitigate activities that may have a negative environmental impact.",
    "Progressively reduce the organisation's environmental footprint.",
    "Encourage the purchase of sustainable and energy-efficient products.",
    "Collaborate in environmental prevention projects and initiatives.",
    "Establish monitoring indicators to measure environmental impacts.",
    "Integrate the resolutions of the Paris Agreement and SDGs 6, 7, 12, 13, 14, 15 and 17.",
    "Apply Principles 7, 8 and 9 of the UN Global Compact on the environment.",
    "Communicate and disseminate the environmental strategy and policy to all stakeholders."
  ]
};

// Small addition not present in the original PHP strings table
DOC_STRINGS.es.cif_label = 'CIF/NIF: ';
DOC_STRINGS.ca.cif_label = 'CIF/NIF: ';
DOC_STRINGS.en.cif_label = 'Tax ID: ';

function docT(lang) {
  return DOC_STRINGS[lang] || DOC_STRINGS.es;
}

function fmt(str) {
  var args = Array.prototype.slice.call(arguments, 1);
  var i = 0;
  return str.replace(/%s/g, function() { return args[i++] != null ? args[i - 1] : ''; });
}

// ===================== OOXML BUILDERS (ported 1:1 from generate-esg-docx.php) =====================
function xEsc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function docPara(text, style, bold, size, color) {
  style = style || 'Normal';
  size = size === undefined ? '22' : size;
  color = color || '';
  var rpr = '';
  if (bold) rpr += '<w:b/>';
  if (size) rpr += '<w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/>';
  if (color) rpr += '<w:color w:val="' + color + '"/>';
  var rprTag = rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '';
  return '\n    <w:p>\n        <w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>\n        <w:r>' + rprTag + '<w:t xml:space="preserve">' + xEsc(text) + '</w:t></w:r>\n    </w:p>';
}

function docHeading(text, level) {
  return docPara(text, 'Heading' + (level || 1));
}

function docBullet(text) {
  return '\n    <w:p>\n        <w:pPr>\n            <w:pStyle w:val="ListParagraph"/>\n            <w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>\n        </w:pPr>\n        <w:r><w:t xml:space="preserve">' + xEsc(text) + '</w:t></w:r>\n    </w:p>';
}

function docSpacer() {
  return '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>';
}

function docGriTag(gri) {
  return ' <w:r><w:rPr><w:color w:val="2E7D32"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t xml:space="preserve"> [' + xEsc(gri) + ']</w:t></w:r>';
}

function docHeadingGri(text, gri, level) {
  level = level || 2;
  return '\n    <w:p>\n        <w:pPr><w:pStyle w:val="Heading' + level + '"/></w:pPr>\n        <w:r><w:t xml:space="preserve">' + xEsc(text) + '</w:t></w:r>' + docGriTag(gri) + '\n    </w:p>';
}

function docTblRow(cells, header) {
  var shading = header ? '<w:shd w:val="clear" w:color="auto" w:fill="1B5E20"/>' : '';
  var color = header ? 'FFFFFF' : '212121';
  var xml = '<w:tr>';
  cells.forEach(function(cell) {
    xml += '\n        <w:tc>\n            <w:tcPr>' + shading + '<w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>\n            <w:p><w:r>\n                <w:rPr>' + (header ? '<w:b/>' : '') + '<w:color w:val="' + color + '"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>\n                <w:t xml:space="preserve">' + xEsc(String(cell)) + '</w:t>\n            </w:r></w:p>\n        </w:tc>';
  });
  xml += '</w:tr>';
  return xml;
}

// 5-column metric table: Indicador / GRI / Año actual / Año-1 / Año-2 — matches
// generate-esg-docx.php exactly. (The separate free-text "Notas" input in the
// web form was collected but never read by the document builder in the
// original tool, so that field was dropped from the form only — these three
// year columns are unrelated to it and are unchanged.)
function docMetricTable(rows) {
  var anyo = new Date().getFullYear();
  var xml = `
    <w:tbl>
        <w:tblPr>
            <w:tblStyle w:val="TableGrid"/>
            <w:tblW w:w="9026" w:type="dxa"/>
            <w:tblBorders>
                <w:top    w:val="single" w:sz="4" w:color="CCCCCC"/>
                <w:left   w:val="single" w:sz="4" w:color="CCCCCC"/>
                <w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/>
                <w:right  w:val="single" w:sz="4" w:color="CCCCCC"/>
                <w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/>
                <w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/>
            </w:tblBorders>
        </w:tblPr>
        <w:tblGrid>
            <w:gridCol w:w="4000"/>
            <w:gridCol w:w="800"/>
            <w:gridCol w:w="1408"/>
            <w:gridCol w:w="1409"/>
            <w:gridCol w:w="1409"/>
        </w:tblGrid>`;

  xml += docTblRow(['Indicador', 'GRI', anyo, anyo - 1, anyo - 2], true);
  rows.forEach(function(r) {
    xml += docTblRow([r.label || '', r.gri || '', r.v1 != null ? r.v1 : 'n/d', r.v2 != null ? r.v2 : 'n/d', r.v3 != null ? r.v3 : 'n/d']);
  });
  xml += '</w:tbl>';
  return xml;
}

function docWrap(body) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"\n' +
'    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"\n' +
'    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"\n' +
'    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"\n' +
'    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n' +
'<w:body>' + body + '\n' +
'<w:sectPr>\n' +
'    <w:pgSz w:w="11906" w:h="16838"/>\n' +
'    <w:pgMar w:top="1417" w:right="1134" w:bottom="1417" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>\n' +
'</w:sectPr>\n' +
'</w:body>\n' +
'</w:document>';
}

// ===================== TEMPLATE 1: REPORTE ASG COMPLETO =====================
function xmlReporte(d, t) {
  var empresa = d.org_nombre || '[Empresa]';
  var sector = d.org_sector || '';
  var anyo = d.org_anyo || new Date().getFullYear();
  var sede = d.org_sede || '';
  var paises = d.org_paises || '';
  var empT = d.org_empleados_total || '';
  var activ = d.org_actividades || '';
  var cif = d.org_cif || '';

  var body = '';

  var camposClave = ['org_nombre', 'org_sector', 'org_actividades', 'emp_gestion', 'amb_politica'];
  var camposVacios = camposClave.filter(function(k) { return !d[k]; });
  if (camposVacios.length >= 3) {
    body += docPara('⚠ DOCUMENTO DE BORRADOR — Este informe se ha generado con datos incompletos. Los campos marcados como [Pendiente] deben completarse antes de su publicación.', 'Normal', false, '11', 'B45309');
    body += docSpacer();
  }

  body += docPara(t.report_title, 'Title');
  body += docPara(empresa, 'Subtitle');
  body += docPara(t.report_subtitle + ' ' + anyo, 'Subtitle');
  body += docPara(t.report_framework, 'Normal', false, '18', '555555');
  body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

  body += docHeading(t.letter_heading, 1);
  body += docPara(fmt(t.letter_p1, empresa, anyo));
  body += docPara(t.letter_p2);
  body += docSpacer();

  body += docHeading(t.org_heading, 1);
  body += docHeadingGri(t.activities_heading, 'GRI 102-2', 2);
  body += docPara(activ || empresa);

  body += docHeadingGri(t.location_heading, 'GRI 102-3 · 102-4', 2);
  if (cif) body += docPara((t.cif_label || 'CIF/NIF: ') + cif);
  if (sede) body += docPara(t.hq_label + sede);
  if (paises) body += docPara(t.countries_label + paises);
  if (empT) body += docPara(t.employees_label + empT);
  body += docSpacer();

  body += docHeadingGri(t.material_heading, 'GRI 102-47', 1);
  var asuntos = (d.org_asuntos || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  if (asuntos.length) {
    asuntos.forEach(function(a) { body += docBullet(a); });
  } else {
    body += docPara(t.material_body);
  }
  body += docSpacer();

  body += docHeading(t.social_heading, 1);

  body += docHeadingGri(t.labour_heading, 'GRI 102-8 · 401-1 · 403-2', 2);
  body += docPara(d.emp_gestion || t.labour_body);
  body += docSpacer();
  body += docMetricTable([
    { label: t.met_emp, gri: '102-8', v1: d.m_emp_actual, v2: d.m_emp_ant1, v3: d.m_emp_ant2 },
    { label: t.met_hire, gri: '401-1', v1: d.m_cont_actual, v2: d.m_cont_ant1, v3: d.m_cont_ant2 },
    { label: t.met_turn, gri: '401-1', v1: d.m_rot_actual, v2: d.m_rot_ant1, v3: d.m_rot_ant2 },
    { label: t.met_abs, gri: '403-2', v1: d.m_abs_actual, v2: d.m_abs_ant1, v3: d.m_abs_ant2 },
    { label: t.met_sal, gri: '102-38', v1: d.m_rem_actual, v2: d.m_rem_ant1, v3: d.m_rem_ant2 },
    { label: t.met_acc, gri: '403-2', v1: d.m_acc_actual, v2: d.m_acc_ant1, v3: d.m_acc_ant2 },
  ]);
  if (d.emp_objetivos) {
    body += docSpacer();
    body += docHeading(t.objectives_heading, 3);
    body += docPara(d.emp_objetivos);
  }
  body += docSpacer();

  body += docHeadingGri(t.dei_heading, 'GRI 405-1 · 405-2 · 406-1', 2);
  body += docMetricTable([
    { label: t.met_women, gri: '405-1', v1: (d.div_mujeres || '') + '%', v2: '', v3: '' },
    { label: t.met_women_mgmt, gri: '405-1', v1: (d.div_mujeres_dir || '') + '%', v2: '', v3: '' },
    { label: t.met_pcd, gri: '405-1', v1: (d.div_pcd || '') + '%', v2: '', v3: '' },
    { label: t.met_pay_gap, gri: '405-2', v1: (d.div_brecha || '') + '%', v2: '', v3: '' },
    { label: t.met_discrim, gri: '406-1', v1: d.div_discrim || '', v2: '', v3: '' },
  ]);
  if (d.div_iniciativas) {
    body += docSpacer();
    body += docPara(d.div_iniciativas);
  }
  body += docSpacer();

  body += docHeadingGri(t.suppliers_heading, 'GRI 308-1 · 414-1 · 204-1', 2);
  body += docPara(d.prov_politica || t.suppliers_body);
  body += docMetricTable([
    { label: t.met_sup_env, gri: '308-1', v1: d.m_prov_amb_a, v2: d.m_prov_amb_b, v3: d.m_prov_amb_c },
    { label: t.met_sup_soc, gri: '414-1', v1: d.m_prov_soc_a, v2: d.m_prov_soc_b, v3: d.m_prov_soc_c },
    { label: t.met_sup_local, gri: '204-1', v1: (d.m_prov_loc_a || '') + '%', v2: (d.m_prov_loc_b || '') + '%', v3: (d.m_prov_loc_c || '') + '%' },
  ]);
  body += docSpacer();

  body += docHeadingGri(t.customers_heading, 'GRI 416-2 · 417-2 · 418-1', 2);
  body += docPara(d.cli_salud || '');
  body += docMetricTable([
    { label: t.met_cli_health, gri: '416-2', v1: d.m_cli_sal_a, v2: d.m_cli_sal_b, v3: d.m_cli_sal_c },
    { label: t.met_cli_label, gri: '417-2', v1: d.m_cli_etq_a, v2: d.m_cli_etq_b, v3: d.m_cli_etq_c },
    { label: t.met_cli_data, gri: '418-1', v1: d.m_cli_dat_a, v2: d.m_cli_dat_b, v3: d.m_cli_dat_c },
  ]);
  body += docSpacer();

  body += docHeading(t.env_heading, 1);
  body += docPara(d.amb_politica || t.env_body);
  body += docSpacer();
  body += docMetricTable([
    { label: t.met_energy, gri: '302-1', v1: d.m_amb_ene_a, v2: d.m_amb_ene_b, v3: d.m_amb_ene_c },
    { label: t.met_renew, gri: '302-1', v1: (d.m_amb_ren_a || '') + '%', v2: (d.m_amb_ren_b || '') + '%', v3: (d.m_amb_ren_c || '') + '%' },
    { label: t.met_water, gri: '303-1', v1: d.m_amb_agu_a, v2: d.m_amb_agu_b, v3: d.m_amb_agu_c },
    { label: t.met_scope1, gri: '305-1', v1: d.m_amb_co1_a, v2: d.m_amb_co1_b, v3: d.m_amb_co1_c },
    { label: t.met_scope2, gri: '305-2', v1: d.m_amb_co2_a, v2: d.m_amb_co2_b, v3: d.m_amb_co2_c },
    { label: t.met_waste, gri: '306-3', v1: d.m_amb_res_a, v2: d.m_amb_res_b, v3: d.m_amb_res_c },
    { label: t.met_recycled, gri: '306-4', v1: (d.m_amb_rec_a || '') + '%', v2: (d.m_amb_rec_b || '') + '%', v3: (d.m_amb_rec_c || '') + '%' },
    { label: t.met_env_pen, gri: '307-1', v1: d.m_amb_san_a, v2: d.m_amb_san_b, v3: d.m_amb_san_c },
  ]);
  if (d.amb_objetivos) {
    body += docSpacer();
    body += docHeading(t.env_obj_heading, 3);
    body += docPara(d.amb_objetivos);
  }
  body += docSpacer();

  body += docHeading(t.gov_heading, 1);
  body += docPara(d.eti_anticorrupcion || t.gov_body);
  body += docSpacer();
  body += docMetricTable([
    { label: t.met_corrupt, gri: '205-3', v1: d.m_eti_cor_a, v2: d.m_eti_cor_b, v3: d.m_eti_cor_c },
    { label: t.met_tax, gri: '207-1', v1: d.m_eti_fis_a, v2: d.m_eti_fis_b, v3: d.m_eti_fis_c },
    { label: t.met_compet, gri: '206-1', v1: d.m_eti_lit_a, v2: d.m_eti_lit_b, v3: d.m_eti_lit_c },
  ]);
  body += docSpacer();

  body += docHeading(t.about_heading, 1);
  body += docPara(t.about_p1);
  body += docPara(fmt(t.about_p2, anyo, empresa, sede ? t.hq_of + sede : ''));
  body += docPara(t.watermark, 'Normal', false, '16', '999999');

  return docWrap(body);
}

// ===================== TEMPLATE 2: POLÍTICA MEDIOAMBIENTAL =====================
function xmlMedioambiental(d, t, lang) {
  var empresa = d.org_nombre || '[Empresa]';
  var anyo = d.org_anyo || new Date().getFullYear();

  var body = '';
  body += docPara(t.pol_title, 'Title');
  body += docPara(empresa + ' · ' + anyo, 'Subtitle');
  body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  body += docSpacer();

  body += docHeading(t.pol_scope_heading, 1);
  body += docPara(fmt(t.pol_scope_body, empresa));
  body += docSpacer();

  body += docHeading(t.pol_commit_heading, 1);
  var compromisos = ENV_COMMITMENTS[lang] || ENV_COMMITMENTS.es;
  compromisos.forEach(function(c) { body += docBullet(c); });
  body += docSpacer();

  if (d.amb_politica) {
    body += docHeading(t.pol_specific_heading, 2);
    body += docPara(d.amb_politica);
    body += docSpacer();
  }

  if (d.amb_objetivos) {
    body += docHeading(t.pol_obj_heading, 2);
    body += docPara(d.amb_objetivos);
    body += docSpacer();
  }

  body += docHeading(t.pol_review_heading, 1);
  body += docPara(fmt(t.pol_review_body, empresa));
  body += docSpacer();

  body += docPara(t.watermark, 'Normal', false, '16', '999999');

  return docWrap(body);
}

// ===================== TEMPLATE 3: CÓDIGO DE CONDUCTA =====================
function xmlConducta(d, t) {
  var empresa = d.org_nombre || '[Empresa]';
  var anyo = d.org_anyo || new Date().getFullYear();

  var body = '';
  body += docPara(t.cod_title, 'Title');
  body += docPara(empresa + ' · ' + anyo, 'Subtitle');
  body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

  body += docHeading(t.cod_object_heading, 1);
  body += docPara(fmt(t.cod_object_body, empresa));
  body += docSpacer();

  body += docHeading(t.cod_scope_heading, 1);
  body += docPara(fmt(t.cod_scope_body, empresa));
  body += docSpacer();

  body += docHeading(t.cod_principles_heading, 1);
  var principios = [
    [t.prin_legal, fmt(t.prin_legal_body, empresa)],
    [t.prin_data, fmt(t.prin_data_body, empresa)],
    [t.prin_integrity, fmt(t.prin_integrity_body, empresa)],
    [t.prin_people, t.prin_people_body],
    [t.prin_env, t.prin_env_body],
  ];
  principios.forEach(function(p) {
    body += docHeading(p[0], 2);
    body += docPara(p[1]);
    body += docSpacer();
  });

  if (d.eti_anticorrupcion) {
    body += docHeading(t.anti_heading, 2);
    body += docPara(d.eti_anticorrupcion);
    body += docSpacer();
  }

  body += docHeading(t.cod_channel_heading, 1);
  body += docPara(t.cod_channel_body);
  body += docSpacer();

  body += docHeading(t.cod_review_heading, 1);
  body += docPara(t.cod_review_body);
  body += docSpacer();

  body += docPara(t.watermark, 'Normal', false, '16', '999999');

  return docWrap(body);
}

// ===================== DOCX PACKAGE (ported 1:1 from generate-esg-docx.php) =====================
function docContentTypes() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
'    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
'    <Default Extension="xml"  ContentType="application/xml"/>\n' +
'    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n' +
'    <Override PartName="/word/styles.xml"   ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n' +
'    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n' +
'</Types>';
}

function docRelsRoot() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
'    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n' +
'    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n' +
'</Relationships>';
}

function docRelsDoc() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
'    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n' +
'</Relationships>';
}

function docCoreProps(d) {
  var empresa = xEsc(d.org_nombre || 'Empresa');
  var anyo = xEsc(d.org_anyo || new Date().getFullYear());
  var now = new Date().toISOString();
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"\n' +
'    xmlns:dc="http://purl.org/dc/elements/1.1/"\n' +
'    xmlns:dcterms="http://purl.org/dc/terms/"\n' +
'    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
'    <dc:title>Informe de Sostenibilidad ASG ' + anyo + '</dc:title>\n' +
'    <dc:creator>' + empresa + '</dc:creator>\n' +
'    <dc:subject>ESG · Sostenibilidad · GRI 2021</dc:subject>\n' +
'    <dc:description>Generado con el Generador de Informe ASG/ESG · yel martinez portfolio</dc:description>\n' +
'    <cp:lastModifiedBy>Yel ESG Tool</cp:lastModifiedBy>\n' +
'    <dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created>\n' +
'    <dcterms:modified xsi:type="dcterms:W3CDTF">' + now + '</dcterms:modified>\n' +
'</cp:coreProperties>';
}

function docStylesXml() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n' +
'    <w:docDefaults>\n' +
'        <w:rPrDefault><w:rPr>\n' +
'            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>\n' +
'            <w:sz w:val="22"/><w:szCs w:val="22"/>\n' +
'            <w:lang w:val="es-ES"/>\n' +
'        </w:rPr></w:rPrDefault>\n' +
'        <w:pPrDefault><w:pPr>\n' +
'            <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>\n' +
'        </w:pPr></w:pPrDefault>\n' +
'    </w:docDefaults>\n' +
'    <w:style w:type="paragraph" w:styleId="Normal">\n' +
'        <w:name w:val="Normal"/>\n' +
'        <w:rPr><w:color w:val="212121"/></w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="paragraph" w:styleId="Title">\n' +
'        <w:name w:val="Title"/>\n' +
'        <w:pPr><w:jc w:val="center"/><w:spacing w:before="480" w:after="240"/></w:pPr>\n' +
'        <w:rPr>\n' +
'            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>\n' +
'            <w:b/><w:sz w:val="52"/><w:szCs w:val="52"/>\n' +
'            <w:color w:val="1B5E20"/>\n' +
'        </w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="paragraph" w:styleId="Subtitle">\n' +
'        <w:name w:val="Subtitle"/>\n' +
'        <w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr>\n' +
'        <w:rPr>\n' +
'            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>\n' +
'            <w:sz w:val="28"/><w:szCs w:val="28"/>\n' +
'            <w:color w:val="388E3C"/>\n' +
'        </w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="paragraph" w:styleId="Heading1">\n' +
'        <w:name w:val="heading 1"/>\n' +
'        <w:pPr>\n' +
'            <w:spacing w:before="400" w:after="160"/>\n' +
'            <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="2E7D32"/></w:pBdr>\n' +
'        </w:pPr>\n' +
'        <w:rPr>\n' +
'            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>\n' +
'            <w:b/><w:sz w:val="32"/><w:szCs w:val="32"/>\n' +
'            <w:color w:val="1B5E20"/>\n' +
'        </w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="paragraph" w:styleId="Heading2">\n' +
'        <w:name w:val="heading 2"/>\n' +
'        <w:pPr><w:spacing w:before="280" w:after="120"/></w:pPr>\n' +
'        <w:rPr>\n' +
'            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>\n' +
'            <w:b/><w:sz w:val="26"/><w:szCs w:val="26"/>\n' +
'            <w:color w:val="2E7D32"/>\n' +
'        </w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="paragraph" w:styleId="Heading3">\n' +
'        <w:name w:val="heading 3"/>\n' +
'        <w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr>\n' +
'        <w:rPr>\n' +
'            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>\n' +
'            <w:b/><w:i/><w:sz w:val="24"/><w:szCs w:val="24"/>\n' +
'            <w:color w:val="388E3C"/>\n' +
'        </w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="paragraph" w:styleId="ListParagraph">\n' +
'        <w:name w:val="List Paragraph"/>\n' +
'        <w:pPr>\n' +
'            <w:ind w:left="720" w:hanging="360"/>\n' +
'            <w:spacing w:after="80"/>\n' +
'        </w:pPr>\n' +
'        <w:rPr><w:color w:val="212121"/></w:rPr>\n' +
'    </w:style>\n' +
'    <w:style w:type="numbering" w:styleId="defaultBullet">\n' +
'        <w:name w:val="defaultBullet"/>\n' +
'    </w:style>\n' +
'    <w:style w:type="table" w:styleId="TableGrid">\n' +
'        <w:name w:val="Table Grid"/>\n' +
'        <w:tblPr>\n' +
'            <w:tblBorders>\n' +
'                <w:top    w:val="single" w:sz="4" w:color="CCCCCC"/>\n' +
'                <w:left   w:val="single" w:sz="4" w:color="CCCCCC"/>\n' +
'                <w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/>\n' +
'                <w:right  w:val="single" w:sz="4" w:color="CCCCCC"/>\n' +
'                <w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/>\n' +
'                <w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/>\n' +
'            </w:tblBorders>\n' +
'        </w:tblPr>\n' +
'    </w:style>\n' +
'</w:styles>';
}

function buildDocxXml(type, d, lang) {
  var t = docT(lang);
  switch (type) {
    case 'medioambiental': return xmlMedioambiental(d, t, lang);
    case 'conducta': return xmlConducta(d, t);
    default: return xmlReporte(d, t);
  }
}

async function buildDocxBlob(type, d, lang) {
  var zip = new JSZip();
  zip.file('[Content_Types].xml', docContentTypes());
  zip.file('_rels/.rels', docRelsRoot());
  zip.file('word/_rels/document.xml.rels', docRelsDoc());
  zip.file('word/document.xml', buildDocxXml(type, d, lang));
  zip.file('word/styles.xml', docStylesXml());
  zip.file('docProps/core.xml', docCoreProps(d));
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// ===================== GENERATE + DOWNLOAD =====================
var DOC_TYPE_PREFIX = {
  reporte: 'Reporte_ASG',
  medioambiental: 'Politica_Medioambiental',
  conducta: 'Codigo_Conducta',
};

async function generateReport() {
  var btn = document.getElementById('gen-btn');
  var output = document.getElementById('ai-output');

  if (btn) { btn.disabled = true; btn.textContent = 'Generando...'; }
  if (output) {
    output.classList.add('loading');
    output.innerHTML = '<span class="spinner"></span> Generando documento Word...';
  }

  try {
    var d = collectFields();
    var blob = await buildDocxBlob(selectedDocType, d, selectedDocLang);

    var empresaSlug = (d.org_nombre || 'empresa').replace(/[^a-zA-Z0-9_-]/g, '_');
    var prefix = DOC_TYPE_PREFIX[selectedDocType] || 'Informe_ESG';
    var filename = prefix + '_' + empresaSlug + '_' + new Date().getFullYear() + '.docx';

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 4000);

    if (output) {
      output.classList.remove('loading');
      output.innerHTML = '<div style="text-align:center;padding:2rem 1rem">' +
        '<div style="font-family:\'Inter\',sans-serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:.5rem">Documento listo</div>' +
        '<div style="color:var(--muted);font-size:12px">' + filename + '</div>' +
        '</div>';
    }
    showToast('¡Descargando documento!');
  } catch (err) {
    if (output) {
      output.classList.remove('loading');
      output.innerHTML = '<span style="color:var(--danger)">Error al generar el documento: ' + xEsc(err.message || String(err)) + '</span>';
    }
    console.error('generateReport error:', err);
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Regenerar'; }
}

// ===================== INIT =====================
saveAndProgress();

// ===================== PUBLIC API =====================
window.ASGESG = {
  navigate: navigate,
  togglePill: togglePill,
  saveAndProgress: saveAndProgress,
  selectDocType: selectDocType,
  selectDocLang: selectDocLang,
  generateReport: generateReport,
};

})();

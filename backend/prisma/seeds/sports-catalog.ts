/**
 * Sports Catalog Seed Data
 *
 * Este archivo contiene todos los deportes soportados con sus:
 * - Posiciones
 * - Categorías de edad
 * - Métricas de rendimiento
 *
 * Ejecutar: npx tsx prisma/seeds/sports-catalog.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type definitions matching Prisma schema

// ============================================
// SPORTS DEFINITIONS
// ============================================

interface SportDefinition {
  name: string;
  slug: string;
  icon: string;
  nameTranslations: Record<string, string>;
  positions: PositionDefinition[];
  ageCategories: AgeCategoryDefinition[];
  metrics: MetricDefinition[];
}

interface PositionDefinition {
  name: string;
  abbreviation: string;
  group?: string;
  nameTranslations: Record<string, string>;
  groupTranslations?: Record<string, string>;
}

interface AgeCategoryDefinition {
  name: string;
  code: string;
  minAge?: number;
  maxAge?: number;
  nameTranslations: Record<string, string>;
}

interface MetricDefinition {
  name: string;
  unit: string;
  type: 'time' | 'distance' | 'weight' | 'reps' | 'score';
  isLowerBetter: boolean;
  nameTranslations: Record<string, string>;
}

// ============================================
// AMERICAN FOOTBALL
// ============================================

const americanFootball: SportDefinition = {
  name: 'American Football',
  slug: 'american-football',
  icon: 'sports_football',
  nameTranslations: {
    en: 'American Football',
    es: 'Fútbol Americano',
    de: 'American Football',
  },
  positions: [
    // Offense
    { name: 'Quarterback', abbreviation: 'QB', group: 'Offense', nameTranslations: { en: 'Quarterback', es: 'Quarterback', de: 'Quarterback' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Running Back', abbreviation: 'RB', group: 'Offense', nameTranslations: { en: 'Running Back', es: 'Corredor', de: 'Running Back' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Fullback', abbreviation: 'FB', group: 'Offense', nameTranslations: { en: 'Fullback', es: 'Fullback', de: 'Fullback' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Wide Receiver', abbreviation: 'WR', group: 'Offense', nameTranslations: { en: 'Wide Receiver', es: 'Receptor Abierto', de: 'Wide Receiver' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Tight End', abbreviation: 'TE', group: 'Offense', nameTranslations: { en: 'Tight End', es: 'Ala Cerrada', de: 'Tight End' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Offensive Line', abbreviation: 'OL', group: 'Offense', nameTranslations: { en: 'Offensive Line', es: 'Línea Ofensiva', de: 'Offensive Line' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Center', abbreviation: 'C', group: 'Offense', nameTranslations: { en: 'Center', es: 'Centro', de: 'Center' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Offensive Guard', abbreviation: 'OG', group: 'Offense', nameTranslations: { en: 'Offensive Guard', es: 'Guardia Ofensivo', de: 'Offensive Guard' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    { name: 'Offensive Tackle', abbreviation: 'OT', group: 'Offense', nameTranslations: { en: 'Offensive Tackle', es: 'Tackle Ofensivo', de: 'Offensive Tackle' }, groupTranslations: { en: 'Offense', es: 'Ataque', de: 'Offense' } },
    // Defense
    { name: 'Defensive Line', abbreviation: 'DL', group: 'Defense', nameTranslations: { en: 'Defensive Line', es: 'Línea Defensiva', de: 'Defensive Line' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Defensive End', abbreviation: 'DE', group: 'Defense', nameTranslations: { en: 'Defensive End', es: 'Ala Defensiva', de: 'Defensive End' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Defensive Tackle', abbreviation: 'DT', group: 'Defense', nameTranslations: { en: 'Defensive Tackle', es: 'Tackle Defensivo', de: 'Defensive Tackle' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Linebacker', abbreviation: 'LB', group: 'Defense', nameTranslations: { en: 'Linebacker', es: 'Apoyador', de: 'Linebacker' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Middle Linebacker', abbreviation: 'MLB', group: 'Defense', nameTranslations: { en: 'Middle Linebacker', es: 'Apoyador Central', de: 'Middle Linebacker' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Outside Linebacker', abbreviation: 'OLB', group: 'Defense', nameTranslations: { en: 'Outside Linebacker', es: 'Apoyador Exterior', de: 'Outside Linebacker' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Defensive Back', abbreviation: 'DB', group: 'Defense', nameTranslations: { en: 'Defensive Back', es: 'Profundo', de: 'Defensive Back' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Cornerback', abbreviation: 'CB', group: 'Defense', nameTranslations: { en: 'Cornerback', es: 'Esquinero', de: 'Cornerback' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Safety', abbreviation: 'S', group: 'Defense', nameTranslations: { en: 'Safety', es: 'Safety', de: 'Safety' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Free Safety', abbreviation: 'FS', group: 'Defense', nameTranslations: { en: 'Free Safety', es: 'Safety Libre', de: 'Free Safety' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    { name: 'Strong Safety', abbreviation: 'SS', group: 'Defense', nameTranslations: { en: 'Strong Safety', es: 'Safety Fuerte', de: 'Strong Safety' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Defense' } },
    // Special Teams
    { name: 'Kicker', abbreviation: 'K', group: 'Special Teams', nameTranslations: { en: 'Kicker', es: 'Pateador', de: 'Kicker' }, groupTranslations: { en: 'Special Teams', es: 'Equipos Especiales', de: 'Special Teams' } },
    { name: 'Punter', abbreviation: 'P', group: 'Special Teams', nameTranslations: { en: 'Punter', es: 'Despejador', de: 'Punter' }, groupTranslations: { en: 'Special Teams', es: 'Equipos Especiales', de: 'Special Teams' } },
    { name: 'Long Snapper', abbreviation: 'LS', group: 'Special Teams', nameTranslations: { en: 'Long Snapper', es: 'Long Snapper', de: 'Long Snapper' }, groupTranslations: { en: 'Special Teams', es: 'Equipos Especiales', de: 'Special Teams' } },
    { name: 'Kick Returner', abbreviation: 'KR', group: 'Special Teams', nameTranslations: { en: 'Kick Returner', es: 'Retornador de Patada', de: 'Kick Returner' }, groupTranslations: { en: 'Special Teams', es: 'Equipos Especiales', de: 'Special Teams' } },
    { name: 'Punt Returner', abbreviation: 'PR', group: 'Special Teams', nameTranslations: { en: 'Punt Returner', es: 'Retornador de Despeje', de: 'Punt Returner' }, groupTranslations: { en: 'Special Teams', es: 'Equipos Especiales', de: 'Special Teams' } },
  ],
  ageCategories: [
    { name: 'Flag (Under 11)', code: 'U11', minAge: 6, maxAge: 10, nameTranslations: { en: 'Flag (Under 11)', es: 'Flag (Sub-11)', de: 'Flag (U11)' } },
    { name: 'Under 13', code: 'U13', minAge: 11, maxAge: 12, nameTranslations: { en: 'Under 13', es: 'Sub-13', de: 'U13' } },
    { name: 'Under 15', code: 'U15', minAge: 13, maxAge: 14, nameTranslations: { en: 'Under 15', es: 'Sub-15', de: 'U15' } },
    { name: 'Under 17', code: 'U17', minAge: 15, maxAge: 16, nameTranslations: { en: 'Under 17', es: 'Sub-17', de: 'U17' } },
    { name: 'Under 19 (Junior)', code: 'U19', minAge: 17, maxAge: 18, nameTranslations: { en: 'Under 19 (Junior)', es: 'Sub-19 (Junior)', de: 'U19 (Junior)' } },
    { name: 'Seniors', code: 'SEN', minAge: 19, maxAge: 34, nameTranslations: { en: 'Seniors', es: 'Seniors', de: 'Seniors' } },
    { name: 'Masters (35+)', code: 'MAS', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Masters (35+)', es: 'Masters (35+)', de: 'Masters (35+)' } },
  ],
  metrics: [
    { name: '40 Yard Dash', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '40 Yard Dash', es: '40 Yardas', de: '40 Yard Dash' } },
    { name: 'Vertical Jump', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'Broad Jump', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Broad Jump', es: 'Salto de Longitud', de: 'Weitsprung' } },
    { name: '3 Cone Drill', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '3 Cone Drill', es: '3 Conos', de: '3 Cone Drill' } },
    { name: 'Pro Agility (5-10-5)', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Pro Agility (5-10-5)', es: 'Pro Agility (5-10-5)', de: 'Pro Agility (5-10-5)' } },
    { name: 'Bench Press (225lbs)', unit: 'reps', type: 'reps', isLowerBetter: false, nameTranslations: { en: 'Bench Press (225lbs)', es: 'Press de Banca (102kg)', de: 'Bankdrücken (102kg)' } },
    { name: '20 Yard Shuttle', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '20 Yard Shuttle', es: '20 Yardas Shuttle', de: '20 Yard Shuttle' } },
    { name: '60 Yard Shuttle', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '60 Yard Shuttle', es: '60 Yardas Shuttle', de: '60 Yard Shuttle' } },
  ],
};

// ============================================
// BASKETBALL
// ============================================

const basketball: SportDefinition = {
  name: 'Basketball',
  slug: 'basketball',
  icon: 'sports_basketball',
  nameTranslations: {
    en: 'Basketball',
    es: 'Baloncesto',
    de: 'Basketball',
  },
  positions: [
    { name: 'Point Guard', abbreviation: 'PG', group: 'Backcourt', nameTranslations: { en: 'Point Guard', es: 'Base', de: 'Point Guard' }, groupTranslations: { en: 'Backcourt', es: 'Perímetro', de: 'Backcourt' } },
    { name: 'Shooting Guard', abbreviation: 'SG', group: 'Backcourt', nameTranslations: { en: 'Shooting Guard', es: 'Escolta', de: 'Shooting Guard' }, groupTranslations: { en: 'Backcourt', es: 'Perímetro', de: 'Backcourt' } },
    { name: 'Small Forward', abbreviation: 'SF', group: 'Frontcourt', nameTranslations: { en: 'Small Forward', es: 'Alero', de: 'Small Forward' }, groupTranslations: { en: 'Frontcourt', es: 'Interior', de: 'Frontcourt' } },
    { name: 'Power Forward', abbreviation: 'PF', group: 'Frontcourt', nameTranslations: { en: 'Power Forward', es: 'Ala-Pívot', de: 'Power Forward' }, groupTranslations: { en: 'Frontcourt', es: 'Interior', de: 'Frontcourt' } },
    { name: 'Center', abbreviation: 'C', group: 'Frontcourt', nameTranslations: { en: 'Center', es: 'Pívot', de: 'Center' }, groupTranslations: { en: 'Frontcourt', es: 'Interior', de: 'Frontcourt' } },
  ],
  ageCategories: [
    { name: 'Mini (Under 10)', code: 'U10', minAge: 6, maxAge: 9, nameTranslations: { en: 'Mini (Under 10)', es: 'Mini (Sub-10)', de: 'Mini (U10)' } },
    { name: 'PreMini (Under 12)', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'PreMini (Under 12)', es: 'PreMini (Sub-12)', de: 'PreMini (U12)' } },
    { name: 'Infantil (Under 14)', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Infantil (Under 14)', es: 'Infantil (Sub-14)', de: 'Infantil (U14)' } },
    { name: 'Cadete (Under 16)', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Cadete (Under 16)', es: 'Cadete (Sub-16)', de: 'Kadetten (U16)' } },
    { name: 'Junior (Under 18)', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Junior (Under 18)', es: 'Junior (Sub-18)', de: 'Junioren (U18)' } },
    { name: 'Sub-22', code: 'U22', minAge: 18, maxAge: 21, nameTranslations: { en: 'Under 22', es: 'Sub-22', de: 'U22' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senior' } },
    { name: 'Masters (35+)', code: 'MAS', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Masters (35+)', es: 'Masters (+35)', de: 'Masters (35+)' } },
  ],
  metrics: [
    { name: 'Lane Agility', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Lane Agility', es: 'Agilidad de Carril', de: 'Lane Agility' } },
    { name: '3/4 Court Sprint', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '3/4 Court Sprint', es: 'Sprint 3/4 Cancha', de: '3/4 Court Sprint' } },
    { name: 'Vertical Jump (No Step)', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump (No Step)', es: 'Salto Vertical (Sin Paso)', de: 'Vertikalsprung (Ohne Anlauf)' } },
    { name: 'Vertical Jump (Max)', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump (Max)', es: 'Salto Vertical (Máximo)', de: 'Vertikalsprung (Max)' } },
    { name: 'Standing Reach', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Standing Reach', es: 'Alcance de Pie', de: 'Reichhöhe' } },
    { name: 'Wingspan', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Wingspan', es: 'Envergadura', de: 'Spannweite' } },
    { name: 'Bench Press', unit: 'reps', type: 'reps', isLowerBetter: false, nameTranslations: { en: 'Bench Press', es: 'Press de Banca', de: 'Bankdrücken' } },
  ],
};

// ============================================
// SOCCER / FOOTBALL
// ============================================

const soccer: SportDefinition = {
  name: 'Soccer',
  slug: 'soccer',
  icon: 'sports_soccer',
  nameTranslations: {
    en: 'Soccer',
    es: 'Fútbol',
    de: 'Fußball',
  },
  positions: [
    // Goalkeeper
    { name: 'Goalkeeper', abbreviation: 'GK', group: 'Goalkeeper', nameTranslations: { en: 'Goalkeeper', es: 'Portero', de: 'Torwart' }, groupTranslations: { en: 'Goalkeeper', es: 'Portería', de: 'Torwart' } },
    // Defenders
    { name: 'Center Back', abbreviation: 'CB', group: 'Defense', nameTranslations: { en: 'Center Back', es: 'Central', de: 'Innenverteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    { name: 'Left Back', abbreviation: 'LB', group: 'Defense', nameTranslations: { en: 'Left Back', es: 'Lateral Izquierdo', de: 'Linker Verteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    { name: 'Right Back', abbreviation: 'RB', group: 'Defense', nameTranslations: { en: 'Right Back', es: 'Lateral Derecho', de: 'Rechter Verteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    { name: 'Left Wing Back', abbreviation: 'LWB', group: 'Defense', nameTranslations: { en: 'Left Wing Back', es: 'Carrilero Izquierdo', de: 'Linker Außenverteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    { name: 'Right Wing Back', abbreviation: 'RWB', group: 'Defense', nameTranslations: { en: 'Right Wing Back', es: 'Carrilero Derecho', de: 'Rechter Außenverteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    // Midfielders
    { name: 'Defensive Midfielder', abbreviation: 'CDM', group: 'Midfield', nameTranslations: { en: 'Defensive Midfielder', es: 'Mediocentro Defensivo', de: 'Defensives Mittelfeld' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    { name: 'Central Midfielder', abbreviation: 'CM', group: 'Midfield', nameTranslations: { en: 'Central Midfielder', es: 'Mediocentro', de: 'Zentrales Mittelfeld' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    { name: 'Attacking Midfielder', abbreviation: 'CAM', group: 'Midfield', nameTranslations: { en: 'Attacking Midfielder', es: 'Mediapunta', de: 'Offensives Mittelfeld' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    { name: 'Left Midfielder', abbreviation: 'LM', group: 'Midfield', nameTranslations: { en: 'Left Midfielder', es: 'Mediocampista Izquierdo', de: 'Linkes Mittelfeld' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    { name: 'Right Midfielder', abbreviation: 'RM', group: 'Midfield', nameTranslations: { en: 'Right Midfielder', es: 'Mediocampista Derecho', de: 'Rechtes Mittelfeld' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    // Forwards
    { name: 'Striker', abbreviation: 'ST', group: 'Forward', nameTranslations: { en: 'Striker', es: 'Delantero Centro', de: 'Stürmer' }, groupTranslations: { en: 'Forward', es: 'Ataque', de: 'Angriff' } },
    { name: 'Center Forward', abbreviation: 'CF', group: 'Forward', nameTranslations: { en: 'Center Forward', es: 'Ariete', de: 'Mittelstürmer' }, groupTranslations: { en: 'Forward', es: 'Ataque', de: 'Angriff' } },
    { name: 'Left Wing', abbreviation: 'LW', group: 'Forward', nameTranslations: { en: 'Left Wing', es: 'Extremo Izquierdo', de: 'Linksaußen' }, groupTranslations: { en: 'Forward', es: 'Ataque', de: 'Angriff' } },
    { name: 'Right Wing', abbreviation: 'RW', group: 'Forward', nameTranslations: { en: 'Right Wing', es: 'Extremo Derecho', de: 'Rechtsaußen' }, groupTranslations: { en: 'Forward', es: 'Ataque', de: 'Angriff' } },
  ],
  ageCategories: [
    { name: 'Prebenjamín (Under 8)', code: 'U8', minAge: 5, maxAge: 7, nameTranslations: { en: 'Prebenjamín (Under 8)', es: 'Prebenjamín (Sub-8)', de: 'Bambini (U8)' } },
    { name: 'Benjamín (Under 10)', code: 'U10', minAge: 8, maxAge: 9, nameTranslations: { en: 'Benjamín (Under 10)', es: 'Benjamín (Sub-10)', de: 'F-Jugend (U10)' } },
    { name: 'Alevín (Under 12)', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Alevín (Under 12)', es: 'Alevín (Sub-12)', de: 'E-Jugend (U12)' } },
    { name: 'Infantil (Under 14)', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Infantil (Under 14)', es: 'Infantil (Sub-14)', de: 'D-Jugend (U14)' } },
    { name: 'Cadete (Under 16)', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Cadete (Under 16)', es: 'Cadete (Sub-16)', de: 'C-Jugend (U16)' } },
    { name: 'Juvenil (Under 18)', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Juvenil (Under 18)', es: 'Juvenil (Sub-18)', de: 'B-Jugend (U18)' } },
    { name: 'Under 21', code: 'U21', minAge: 18, maxAge: 20, nameTranslations: { en: 'Under 21', es: 'Sub-21', de: 'A-Jugend (U21)' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senioren' } },
    { name: 'Veterano (35+)', code: 'VET', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Veterans (35+)', es: 'Veteranos (+35)', de: 'Alte Herren (35+)' } },
  ],
  metrics: [
    { name: '30m Sprint', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '30m Sprint', es: 'Sprint 30m', de: '30m Sprint' } },
    { name: 'Yo-Yo Intermittent Recovery', unit: 'level', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Yo-Yo Intermittent Recovery', es: 'Yo-Yo Recuperación Intermitente', de: 'Yo-Yo Intermittent Recovery' } },
    { name: 'Vertical Jump', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'Agility T-Test', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Agility T-Test', es: 'T-Test de Agilidad', de: 'T-Test' } },
    { name: 'VO2 Max Estimate', unit: 'ml/kg/min', type: 'score', isLowerBetter: false, nameTranslations: { en: 'VO2 Max Estimate', es: 'VO2 Max Estimado', de: 'VO2 Max Schätzung' } },
    { name: 'Repeated Sprint Ability', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Repeated Sprint Ability', es: 'Capacidad de Sprints Repetidos', de: 'Repeated Sprint Ability' } },
  ],
};

// ============================================
// HANDBALL
// ============================================

const handball: SportDefinition = {
  name: 'Handball',
  slug: 'handball',
  icon: 'sports_handball',
  nameTranslations: {
    en: 'Handball',
    es: 'Balonmano',
    de: 'Handball',
  },
  positions: [
    { name: 'Goalkeeper', abbreviation: 'GK', group: 'Goalkeeper', nameTranslations: { en: 'Goalkeeper', es: 'Portero', de: 'Torwart' }, groupTranslations: { en: 'Goalkeeper', es: 'Portería', de: 'Torwart' } },
    { name: 'Left Wing', abbreviation: 'LW', group: 'Wing', nameTranslations: { en: 'Left Wing', es: 'Extremo Izquierdo', de: 'Linksaußen' }, groupTranslations: { en: 'Wing', es: 'Extremos', de: 'Außen' } },
    { name: 'Right Wing', abbreviation: 'RW', group: 'Wing', nameTranslations: { en: 'Right Wing', es: 'Extremo Derecho', de: 'Rechtsaußen' }, groupTranslations: { en: 'Wing', es: 'Extremos', de: 'Außen' } },
    { name: 'Left Back', abbreviation: 'LB', group: 'Back', nameTranslations: { en: 'Left Back', es: 'Lateral Izquierdo', de: 'Rückraum Links' }, groupTranslations: { en: 'Back', es: 'Laterales', de: 'Rückraum' } },
    { name: 'Center Back', abbreviation: 'CB', group: 'Back', nameTranslations: { en: 'Center Back', es: 'Central', de: 'Rückraum Mitte' }, groupTranslations: { en: 'Back', es: 'Laterales', de: 'Rückraum' } },
    { name: 'Right Back', abbreviation: 'RB', group: 'Back', nameTranslations: { en: 'Right Back', es: 'Lateral Derecho', de: 'Rückraum Rechts' }, groupTranslations: { en: 'Back', es: 'Laterales', de: 'Rückraum' } },
    { name: 'Pivot', abbreviation: 'P', group: 'Pivot', nameTranslations: { en: 'Pivot', es: 'Pivote', de: 'Kreisläufer' }, groupTranslations: { en: 'Pivot', es: 'Pivote', de: 'Kreis' } },
  ],
  ageCategories: [
    { name: 'Mini (Under 10)', code: 'U10', minAge: 6, maxAge: 9, nameTranslations: { en: 'Mini (Under 10)', es: 'Mini (Sub-10)', de: 'Mini (U10)' } },
    { name: 'Benjamín (Under 12)', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Benjamín (Under 12)', es: 'Benjamín (Sub-12)', de: 'E-Jugend (U12)' } },
    { name: 'Alevín (Under 14)', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Alevín (Under 14)', es: 'Alevín (Sub-14)', de: 'D-Jugend (U14)' } },
    { name: 'Infantil (Under 16)', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Infantil (Under 16)', es: 'Infantil (Sub-16)', de: 'C-Jugend (U16)' } },
    { name: 'Cadete (Under 18)', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Cadete (Under 18)', es: 'Cadete (Sub-18)', de: 'B-Jugend (U18)' } },
    { name: 'Juvenil (Under 20)', code: 'U20', minAge: 18, maxAge: 19, nameTranslations: { en: 'Juvenil (Under 20)', es: 'Juvenil (Sub-20)', de: 'A-Jugend (U20)' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senioren' } },
    { name: 'Veterano (35+)', code: 'VET', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Veterans (35+)', es: 'Veteranos (+35)', de: 'Alte Herren (35+)' } },
  ],
  metrics: [
    { name: '30m Sprint', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '30m Sprint', es: 'Sprint 30m', de: '30m Sprint' } },
    { name: 'Throwing Velocity', unit: 'km/h', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Throwing Velocity', es: 'Velocidad de Lanzamiento', de: 'Wurfgeschwindigkeit' } },
    { name: 'Vertical Jump', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'T-Test', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'T-Test', es: 'T-Test', de: 'T-Test' } },
    { name: 'Beep Test (Level)', unit: 'level', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Beep Test (Level)', es: 'Test de Beep (Nivel)', de: 'Beep Test (Level)' } },
    { name: 'Medicine Ball Throw', unit: 'meters', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Medicine Ball Throw', es: 'Lanzamiento de Balón Medicinal', de: 'Medizinballwurf' } },
  ],
};

// ============================================
// RUGBY
// ============================================

const rugby: SportDefinition = {
  name: 'Rugby',
  slug: 'rugby',
  icon: 'sports_rugby',
  nameTranslations: {
    en: 'Rugby',
    es: 'Rugby',
    de: 'Rugby',
  },
  positions: [
    // Forwards
    { name: 'Loosehead Prop', abbreviation: '1', group: 'Forwards', nameTranslations: { en: 'Loosehead Prop', es: 'Pilar Izquierdo', de: 'Loosehead Prop' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Hooker', abbreviation: '2', group: 'Forwards', nameTranslations: { en: 'Hooker', es: 'Talonador', de: 'Hakler' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Tighthead Prop', abbreviation: '3', group: 'Forwards', nameTranslations: { en: 'Tighthead Prop', es: 'Pilar Derecho', de: 'Tighthead Prop' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Lock', abbreviation: '4', group: 'Forwards', nameTranslations: { en: 'Lock (4)', es: 'Segunda Línea (4)', de: 'Lock (4)' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Lock', abbreviation: '5', group: 'Forwards', nameTranslations: { en: 'Lock (5)', es: 'Segunda Línea (5)', de: 'Lock (5)' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Blindside Flanker', abbreviation: '6', group: 'Forwards', nameTranslations: { en: 'Blindside Flanker', es: 'Ala Ciego', de: 'Blindside Flanker' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Openside Flanker', abbreviation: '7', group: 'Forwards', nameTranslations: { en: 'Openside Flanker', es: 'Ala Abierto', de: 'Openside Flanker' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    { name: 'Number Eight', abbreviation: '8', group: 'Forwards', nameTranslations: { en: 'Number Eight', es: 'Octavo', de: 'Number Eight' }, groupTranslations: { en: 'Forwards', es: 'Delanteros', de: 'Sturm' } },
    // Backs
    { name: 'Scrum-half', abbreviation: '9', group: 'Backs', nameTranslations: { en: 'Scrum-half', es: 'Medio Melé', de: 'Gedrängehalb' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
    { name: 'Fly-half', abbreviation: '10', group: 'Backs', nameTranslations: { en: 'Fly-half', es: 'Apertura', de: 'Verbinder' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
    { name: 'Left Wing', abbreviation: '11', group: 'Backs', nameTranslations: { en: 'Left Wing', es: 'Ala Izquierdo', de: 'Linker Flügel' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
    { name: 'Inside Centre', abbreviation: '12', group: 'Backs', nameTranslations: { en: 'Inside Centre', es: 'Primer Centro', de: 'Innendreiviertel' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
    { name: 'Outside Centre', abbreviation: '13', group: 'Backs', nameTranslations: { en: 'Outside Centre', es: 'Segundo Centro', de: 'Außendreiviertel' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
    { name: 'Right Wing', abbreviation: '14', group: 'Backs', nameTranslations: { en: 'Right Wing', es: 'Ala Derecho', de: 'Rechter Flügel' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
    { name: 'Fullback', abbreviation: '15', group: 'Backs', nameTranslations: { en: 'Fullback', es: 'Zaguero', de: 'Schlussmann' }, groupTranslations: { en: 'Backs', es: 'Tres Cuartos', de: 'Hintermannschaft' } },
  ],
  ageCategories: [
    { name: 'Under 6 (Tag)', code: 'U6', minAge: 4, maxAge: 5, nameTranslations: { en: 'Under 6 (Tag)', es: 'Sub-6 (Tag)', de: 'U6 (Tag)' } },
    { name: 'Under 8', code: 'U8', minAge: 6, maxAge: 7, nameTranslations: { en: 'Under 8', es: 'Sub-8', de: 'U8' } },
    { name: 'Under 10', code: 'U10', minAge: 8, maxAge: 9, nameTranslations: { en: 'Under 10', es: 'Sub-10', de: 'U10' } },
    { name: 'Under 12', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Under 12', es: 'Sub-12', de: 'U12' } },
    { name: 'Under 14', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Under 14', es: 'Sub-14', de: 'U14' } },
    { name: 'Under 16', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Under 16', es: 'Sub-16', de: 'U16' } },
    { name: 'Under 18', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Under 18', es: 'Sub-18', de: 'U18' } },
    { name: 'Under 20 (Colts)', code: 'U20', minAge: 18, maxAge: 19, nameTranslations: { en: 'Under 20 (Colts)', es: 'Sub-20 (Colts)', de: 'U20 (Colts)' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senioren' } },
    { name: 'Veterans (35+)', code: 'VET', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Veterans (35+)', es: 'Veteranos (+35)', de: 'Alte Herren (35+)' } },
  ],
  metrics: [
    { name: '40m Sprint', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '40m Sprint', es: 'Sprint 40m', de: '40m Sprint' } },
    { name: 'Yo-Yo Test', unit: 'level', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Yo-Yo Test', es: 'Test Yo-Yo', de: 'Yo-Yo Test' } },
    { name: 'Vertical Jump', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'Bench Press', unit: 'kg', type: 'weight', isLowerBetter: false, nameTranslations: { en: 'Bench Press', es: 'Press de Banca', de: 'Bankdrücken' } },
    { name: 'Back Squat', unit: 'kg', type: 'weight', isLowerBetter: false, nameTranslations: { en: 'Back Squat', es: 'Sentadilla', de: 'Kniebeuge' } },
    { name: 'Prone Row', unit: 'kg', type: 'weight', isLowerBetter: false, nameTranslations: { en: 'Prone Row', es: 'Remo Prono', de: 'Liegendes Rudern' } },
    { name: '505 Agility Test', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '505 Agility Test', es: 'Test de Agilidad 505', de: '505 Agilitätstest' } },
  ],
};

// ============================================
// VOLLEYBALL
// ============================================

const volleyball: SportDefinition = {
  name: 'Volleyball',
  slug: 'volleyball',
  icon: 'sports_volleyball',
  nameTranslations: {
    en: 'Volleyball',
    es: 'Voleibol',
    de: 'Volleyball',
  },
  positions: [
    { name: 'Setter', abbreviation: 'S', group: 'Setter', nameTranslations: { en: 'Setter', es: 'Colocador', de: 'Zuspieler' }, groupTranslations: { en: 'Setter', es: 'Colocador', de: 'Zuspieler' } },
    { name: 'Outside Hitter', abbreviation: 'OH', group: 'Hitter', nameTranslations: { en: 'Outside Hitter', es: 'Receptor/Atacante', de: 'Außenangreifer' }, groupTranslations: { en: 'Hitter', es: 'Atacantes', de: 'Angreifer' } },
    { name: 'Opposite', abbreviation: 'OPP', group: 'Hitter', nameTranslations: { en: 'Opposite', es: 'Opuesto', de: 'Diagonalangreifer' }, groupTranslations: { en: 'Hitter', es: 'Atacantes', de: 'Angreifer' } },
    { name: 'Middle Blocker', abbreviation: 'MB', group: 'Middle', nameTranslations: { en: 'Middle Blocker', es: 'Central', de: 'Mittelblocker' }, groupTranslations: { en: 'Middle', es: 'Centrales', de: 'Mitte' } },
    { name: 'Libero', abbreviation: 'L', group: 'Libero', nameTranslations: { en: 'Libero', es: 'Líbero', de: 'Libero' }, groupTranslations: { en: 'Libero', es: 'Líbero', de: 'Libero' } },
  ],
  ageCategories: [
    { name: 'Alevín (Under 12)', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Alevín (Under 12)', es: 'Alevín (Sub-12)', de: 'U12' } },
    { name: 'Infantil (Under 14)', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Infantil (Under 14)', es: 'Infantil (Sub-14)', de: 'U14' } },
    { name: 'Cadete (Under 16)', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Cadete (Under 16)', es: 'Cadete (Sub-16)', de: 'U16' } },
    { name: 'Juvenil (Under 18)', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Juvenil (Under 18)', es: 'Juvenil (Sub-18)', de: 'U18' } },
    { name: 'Junior (Under 21)', code: 'U21', minAge: 18, maxAge: 20, nameTranslations: { en: 'Junior (Under 21)', es: 'Junior (Sub-21)', de: 'U21' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senioren' } },
    { name: 'Veterano (35+)', code: 'VET', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Veterans (35+)', es: 'Veteranos (+35)', de: 'Alte Herren (35+)' } },
  ],
  metrics: [
    { name: 'Vertical Jump (Block)', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump (Block)', es: 'Salto de Bloqueo', de: 'Blocksprung' } },
    { name: 'Vertical Jump (Spike)', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump (Spike)', es: 'Salto de Remate', de: 'Angriffssprung' } },
    { name: 'Spike Velocity', unit: 'km/h', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Spike Velocity', es: 'Velocidad de Remate', de: 'Angriffsgeschwindigkeit' } },
    { name: 'Agility Test', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Agility Test', es: 'Test de Agilidad', de: 'Agilitätstest' } },
    { name: 'Standing Reach', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Standing Reach', es: 'Alcance de Pie', de: 'Reichhöhe' } },
    { name: 'Block Reach', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Block Reach', es: 'Alcance de Bloqueo', de: 'Blockhöhe' } },
    { name: 'Spike Reach', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Spike Reach', es: 'Alcance de Remate', de: 'Angriffshöhe' } },
  ],
};

// ============================================
// ICE HOCKEY
// ============================================

const iceHockey: SportDefinition = {
  name: 'Ice Hockey',
  slug: 'ice-hockey',
  icon: 'sports_hockey',
  nameTranslations: {
    en: 'Ice Hockey',
    es: 'Hockey sobre Hielo',
    de: 'Eishockey',
  },
  positions: [
    // Goaltender
    { name: 'Goaltender', abbreviation: 'G', group: 'Goaltender', nameTranslations: { en: 'Goaltender', es: 'Portero', de: 'Torwart' }, groupTranslations: { en: 'Goaltender', es: 'Portero', de: 'Torwart' } },
    // Defensemen
    { name: 'Left Defenseman', abbreviation: 'LD', group: 'Defense', nameTranslations: { en: 'Left Defenseman', es: 'Defensa Izquierdo', de: 'Linker Verteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    { name: 'Right Defenseman', abbreviation: 'RD', group: 'Defense', nameTranslations: { en: 'Right Defenseman', es: 'Defensa Derecho', de: 'Rechter Verteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    // Forwards
    { name: 'Center', abbreviation: 'C', group: 'Forward', nameTranslations: { en: 'Center', es: 'Centro', de: 'Center' }, groupTranslations: { en: 'Forward', es: 'Delantero', de: 'Sturm' } },
    { name: 'Left Wing', abbreviation: 'LW', group: 'Forward', nameTranslations: { en: 'Left Wing', es: 'Ala Izquierda', de: 'Linker Flügel' }, groupTranslations: { en: 'Forward', es: 'Delantero', de: 'Sturm' } },
    { name: 'Right Wing', abbreviation: 'RW', group: 'Forward', nameTranslations: { en: 'Right Wing', es: 'Ala Derecha', de: 'Rechter Flügel' }, groupTranslations: { en: 'Forward', es: 'Delantero', de: 'Sturm' } },
  ],
  ageCategories: [
    { name: 'Mite (Under 8)', code: 'U8', minAge: 5, maxAge: 7, nameTranslations: { en: 'Mite (Under 8)', es: 'Mite (Sub-8)', de: 'Kleinstschüler (U8)' } },
    { name: 'Squirt (Under 10)', code: 'U10', minAge: 8, maxAge: 9, nameTranslations: { en: 'Squirt (Under 10)', es: 'Squirt (Sub-10)', de: 'Kleinschüler (U10)' } },
    { name: 'Peewee (Under 12)', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Peewee (Under 12)', es: 'Peewee (Sub-12)', de: 'Knaben (U12)' } },
    { name: 'Bantam (Under 14)', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Bantam (Under 14)', es: 'Bantam (Sub-14)', de: 'Schüler (U14)' } },
    { name: 'Midget (Under 16)', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Midget (Under 16)', es: 'Midget (Sub-16)', de: 'Jugend (U16)' } },
    { name: 'Junior (Under 18)', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Junior (Under 18)', es: 'Junior (Sub-18)', de: 'Junioren (U18)' } },
    { name: 'Junior (Under 20)', code: 'U20', minAge: 18, maxAge: 19, nameTranslations: { en: 'Junior (Under 20)', es: 'Junior (Sub-20)', de: 'Junioren (U20)' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senioren' } },
    { name: 'Masters (35+)', code: 'MAS', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Masters (35+)', es: 'Masters (+35)', de: 'Alte Herren (35+)' } },
  ],
  metrics: [
    { name: '40m Skating Sprint', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '40m Skating Sprint', es: 'Sprint 40m Patinaje', de: '40m Skating Sprint' } },
    { name: 'Shot Speed', unit: 'km/h', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Shot Speed', es: 'Velocidad de Tiro', de: 'Schussgeschwindigkeit' } },
    { name: 'Vertical Jump', unit: 'cm', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'Agility Skate', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Agility Skate', es: 'Agilidad en Patines', de: 'Agilitäts-Skating' } },
    { name: 'Bench Press', unit: 'kg', type: 'weight', isLowerBetter: false, nameTranslations: { en: 'Bench Press', es: 'Press de Banca', de: 'Bankdrücken' } },
    { name: 'Pro Agility', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Pro Agility', es: 'Pro Agility', de: 'Pro Agility' } },
  ],
};

// ============================================
// BASEBALL
// ============================================

const baseball: SportDefinition = {
  name: 'Baseball',
  slug: 'baseball',
  icon: 'sports_baseball',
  nameTranslations: {
    en: 'Baseball',
    es: 'Béisbol',
    de: 'Baseball',
  },
  positions: [
    // Battery
    { name: 'Pitcher', abbreviation: 'P', group: 'Battery', nameTranslations: { en: 'Pitcher', es: 'Lanzador', de: 'Pitcher' }, groupTranslations: { en: 'Battery', es: 'Batería', de: 'Batterie' } },
    { name: 'Catcher', abbreviation: 'C', group: 'Battery', nameTranslations: { en: 'Catcher', es: 'Receptor', de: 'Catcher' }, groupTranslations: { en: 'Battery', es: 'Batería', de: 'Batterie' } },
    // Infield
    { name: 'First Baseman', abbreviation: '1B', group: 'Infield', nameTranslations: { en: 'First Baseman', es: 'Primera Base', de: 'Erste Base' }, groupTranslations: { en: 'Infield', es: 'Cuadro Interior', de: 'Infield' } },
    { name: 'Second Baseman', abbreviation: '2B', group: 'Infield', nameTranslations: { en: 'Second Baseman', es: 'Segunda Base', de: 'Zweite Base' }, groupTranslations: { en: 'Infield', es: 'Cuadro Interior', de: 'Infield' } },
    { name: 'Shortstop', abbreviation: 'SS', group: 'Infield', nameTranslations: { en: 'Shortstop', es: 'Campocorto', de: 'Shortstop' }, groupTranslations: { en: 'Infield', es: 'Cuadro Interior', de: 'Infield' } },
    { name: 'Third Baseman', abbreviation: '3B', group: 'Infield', nameTranslations: { en: 'Third Baseman', es: 'Tercera Base', de: 'Dritte Base' }, groupTranslations: { en: 'Infield', es: 'Cuadro Interior', de: 'Infield' } },
    // Outfield
    { name: 'Left Fielder', abbreviation: 'LF', group: 'Outfield', nameTranslations: { en: 'Left Fielder', es: 'Jardinero Izquierdo', de: 'Linker Außenfeldspieler' }, groupTranslations: { en: 'Outfield', es: 'Jardín', de: 'Outfield' } },
    { name: 'Center Fielder', abbreviation: 'CF', group: 'Outfield', nameTranslations: { en: 'Center Fielder', es: 'Jardinero Central', de: 'Center Fielder' }, groupTranslations: { en: 'Outfield', es: 'Jardín', de: 'Outfield' } },
    { name: 'Right Fielder', abbreviation: 'RF', group: 'Outfield', nameTranslations: { en: 'Right Fielder', es: 'Jardinero Derecho', de: 'Rechter Außenfeldspieler' }, groupTranslations: { en: 'Outfield', es: 'Jardín', de: 'Outfield' } },
    // Designated Hitter
    { name: 'Designated Hitter', abbreviation: 'DH', group: 'Designated', nameTranslations: { en: 'Designated Hitter', es: 'Bateador Designado', de: 'Designated Hitter' }, groupTranslations: { en: 'Designated', es: 'Designado', de: 'Designated' } },
  ],
  ageCategories: [
    { name: 'Tee Ball (Under 6)', code: 'U6', minAge: 4, maxAge: 5, nameTranslations: { en: 'Tee Ball (Under 6)', es: 'Tee Ball (Sub-6)', de: 'Tee Ball (U6)' } },
    { name: 'Coach Pitch (Under 8)', code: 'U8', minAge: 6, maxAge: 7, nameTranslations: { en: 'Coach Pitch (Under 8)', es: 'Coach Pitch (Sub-8)', de: 'Coach Pitch (U8)' } },
    { name: 'Minors (Under 10)', code: 'U10', minAge: 8, maxAge: 9, nameTranslations: { en: 'Minors (Under 10)', es: 'Menores (Sub-10)', de: 'Minors (U10)' } },
    { name: 'Majors (Under 12)', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Majors (Under 12)', es: 'Mayores (Sub-12)', de: 'Majors (U12)' } },
    { name: 'Junior (Under 14)', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Junior (Under 14)', es: 'Junior (Sub-14)', de: 'Junior (U14)' } },
    { name: 'Senior (Under 16)', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Senior (Under 16)', es: 'Senior (Sub-16)', de: 'Senior (U16)' } },
    { name: 'High School (Under 18)', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'High School (Under 18)', es: 'Preparatoria (Sub-18)', de: 'High School (U18)' } },
    { name: 'College/Adult', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'College/Adult', es: 'Universitario/Adulto', de: 'College/Erwachsene' } },
    { name: 'Masters (35+)', code: 'MAS', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Masters (35+)', es: 'Masters (+35)', de: 'Masters (35+)' } },
  ],
  metrics: [
    { name: '60 Yard Dash', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '60 Yard Dash', es: '60 Yardas', de: '60 Yard Dash' } },
    { name: 'Exit Velocity', unit: 'mph', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Exit Velocity', es: 'Velocidad de Salida', de: 'Exit Velocity' } },
    { name: 'Throwing Velocity', unit: 'mph', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Throwing Velocity', es: 'Velocidad de Lanzamiento', de: 'Wurfgeschwindigkeit' } },
    { name: 'Home to First', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Home to First', es: 'Home a Primera', de: 'Home to First' } },
    { name: 'Vertical Jump', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'Broad Jump', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Broad Jump', es: 'Salto de Longitud', de: 'Weitsprung' } },
  ],
};

// ============================================
// LACROSSE
// ============================================

const lacrosse: SportDefinition = {
  name: 'Lacrosse',
  slug: 'lacrosse',
  icon: 'sports',
  nameTranslations: {
    en: 'Lacrosse',
    es: 'Lacrosse',
    de: 'Lacrosse',
  },
  positions: [
    // Goalie
    { name: 'Goalie', abbreviation: 'G', group: 'Goalie', nameTranslations: { en: 'Goalie', es: 'Portero', de: 'Torwart' }, groupTranslations: { en: 'Goalie', es: 'Portero', de: 'Torwart' } },
    // Defense
    { name: 'Close Defense', abbreviation: 'CD', group: 'Defense', nameTranslations: { en: 'Close Defense', es: 'Defensa Cercano', de: 'Enger Verteidiger' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    { name: 'Long Stick Midfielder', abbreviation: 'LSM', group: 'Defense', nameTranslations: { en: 'Long Stick Midfielder', es: 'Mediocampista Palo Largo', de: 'Long Stick Midfielder' }, groupTranslations: { en: 'Defense', es: 'Defensa', de: 'Verteidigung' } },
    // Midfield
    { name: 'Midfielder', abbreviation: 'M', group: 'Midfield', nameTranslations: { en: 'Midfielder', es: 'Mediocampista', de: 'Mittelfeldspieler' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    { name: 'Face-Off Specialist', abbreviation: 'FOGO', group: 'Midfield', nameTranslations: { en: 'Face-Off Specialist', es: 'Especialista Face-Off', de: 'Face-Off Spezialist' }, groupTranslations: { en: 'Midfield', es: 'Mediocampo', de: 'Mittelfeld' } },
    // Attack
    { name: 'Attack', abbreviation: 'A', group: 'Attack', nameTranslations: { en: 'Attack', es: 'Atacante', de: 'Angreifer' }, groupTranslations: { en: 'Attack', es: 'Ataque', de: 'Angriff' } },
    { name: 'Crease Attack', abbreviation: 'CA', group: 'Attack', nameTranslations: { en: 'Crease Attack', es: 'Atacante de Área', de: 'Crease Angreifer' }, groupTranslations: { en: 'Attack', es: 'Ataque', de: 'Angriff' } },
  ],
  ageCategories: [
    { name: 'Under 8', code: 'U8', minAge: 6, maxAge: 7, nameTranslations: { en: 'Under 8', es: 'Sub-8', de: 'U8' } },
    { name: 'Under 10', code: 'U10', minAge: 8, maxAge: 9, nameTranslations: { en: 'Under 10', es: 'Sub-10', de: 'U10' } },
    { name: 'Under 12', code: 'U12', minAge: 10, maxAge: 11, nameTranslations: { en: 'Under 12', es: 'Sub-12', de: 'U12' } },
    { name: 'Under 14', code: 'U14', minAge: 12, maxAge: 13, nameTranslations: { en: 'Under 14', es: 'Sub-14', de: 'U14' } },
    { name: 'Under 16', code: 'U16', minAge: 14, maxAge: 15, nameTranslations: { en: 'Under 16', es: 'Sub-16', de: 'U16' } },
    { name: 'Under 18', code: 'U18', minAge: 16, maxAge: 17, nameTranslations: { en: 'Under 18', es: 'Sub-18', de: 'U18' } },
    { name: 'College', code: 'COL', minAge: 18, maxAge: 22, nameTranslations: { en: 'College', es: 'Universitario', de: 'College' } },
    { name: 'Senior', code: 'SEN', minAge: 18, maxAge: 34, nameTranslations: { en: 'Senior', es: 'Senior', de: 'Senioren' } },
    { name: 'Masters (35+)', code: 'MAS', minAge: 35, maxAge: undefined, nameTranslations: { en: 'Masters (35+)', es: 'Masters (+35)', de: 'Masters (35+)' } },
  ],
  metrics: [
    { name: '40 Yard Dash', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: '40 Yard Dash', es: '40 Yardas', de: '40 Yard Dash' } },
    { name: 'Shot Speed', unit: 'mph', type: 'score', isLowerBetter: false, nameTranslations: { en: 'Shot Speed', es: 'Velocidad de Tiro', de: 'Schussgeschwindigkeit' } },
    { name: 'Vertical Jump', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Vertical Jump', es: 'Salto Vertical', de: 'Vertikalsprung' } },
    { name: 'Pro Agility (5-10-5)', unit: 'seconds', type: 'time', isLowerBetter: true, nameTranslations: { en: 'Pro Agility (5-10-5)', es: 'Pro Agility (5-10-5)', de: 'Pro Agility (5-10-5)' } },
    { name: 'Broad Jump', unit: 'inches', type: 'distance', isLowerBetter: false, nameTranslations: { en: 'Broad Jump', es: 'Salto de Longitud', de: 'Weitsprung' } },
    { name: 'Bench Press', unit: 'reps', type: 'reps', isLowerBetter: false, nameTranslations: { en: 'Bench Press', es: 'Press de Banca', de: 'Bankdrücken' } },
  ],
};

// ============================================
// ALL SPORTS COLLECTION
// ============================================

export const allSports: SportDefinition[] = [
  americanFootball,
  basketball,
  soccer,
  handball,
  rugby,
  volleyball,
  iceHockey,
  baseball,
  lacrosse,
];

// ============================================
// SEED FUNCTION
// ============================================

async function seedSports() {
  console.log('🏆 Seeding sports catalog...\n');

  for (const sportDef of allSports) {
    console.log(`📌 Creating sport: ${sportDef.name}`);

    // Upsert sport
    const sport = await prisma.sport.upsert({
      where: { slug: sportDef.slug },
      update: {
        name: sportDef.name,
        icon: sportDef.icon,
        nameTranslations: sportDef.nameTranslations,
        isActive: true,
      },
      create: {
        name: sportDef.name,
        slug: sportDef.slug,
        icon: sportDef.icon,
        nameTranslations: sportDef.nameTranslations,
        isActive: true,
        displayOrder: allSports.indexOf(sportDef),
      },
    });

    // Seed positions
    for (let i = 0; i < sportDef.positions.length; i++) {
      const pos = sportDef.positions[i];
      await prisma.position.upsert({
        where: {
          sportId_abbreviation: {
            sportId: sport.id,
            abbreviation: pos.abbreviation,
          },
        },
        update: {
          name: pos.name,
          group: pos.group,
          nameTranslations: pos.nameTranslations,
          groupTranslations: pos.groupTranslations || {},
          displayOrder: i,
        },
        create: {
          sportId: sport.id,
          name: pos.name,
          abbreviation: pos.abbreviation,
          group: pos.group,
          nameTranslations: pos.nameTranslations,
          groupTranslations: pos.groupTranslations || {},
          displayOrder: i,
        },
      });
    }

    // Seed age categories
    for (let i = 0; i < sportDef.ageCategories.length; i++) {
      const cat = sportDef.ageCategories[i];
      await prisma.ageCategory.upsert({
        where: {
          sportId_code: {
            sportId: sport.id,
            code: cat.code,
          },
        },
        update: {
          name: cat.name,
          minAge: cat.minAge,
          maxAge: cat.maxAge,
          nameTranslations: cat.nameTranslations,
          displayOrder: i,
        },
        create: {
          sportId: sport.id,
          name: cat.name,
          code: cat.code,
          minAge: cat.minAge,
          maxAge: cat.maxAge,
          nameTranslations: cat.nameTranslations,
          displayOrder: i,
        },
      });
    }

    // Seed metrics
    for (let i = 0; i < sportDef.metrics.length; i++) {
      const metric = sportDef.metrics[i];
      await prisma.sportMetric.upsert({
        where: {
          sportId_name: {
            sportId: sport.id,
            name: metric.name,
          },
        },
        update: {
          unit: metric.unit,
          type: metric.type,
          isLowerBetter: metric.isLowerBetter,
          nameTranslations: metric.nameTranslations,
          displayOrder: i,
        },
        create: {
          sportId: sport.id,
          name: metric.name,
          unit: metric.unit,
          type: metric.type,
          isLowerBetter: metric.isLowerBetter,
          nameTranslations: metric.nameTranslations,
          displayOrder: i,
        },
      });
    }

    console.log(`   ✅ ${sportDef.positions.length} positions`);
    console.log(`   ✅ ${sportDef.ageCategories.length} age categories`);
    console.log(`   ✅ ${sportDef.metrics.length} metrics\n`);
  }

  console.log('✨ Sports catalog seeding complete!\n');
}

// Export for use in migrations or standalone execution
export { seedSports };

// Main execution
async function main() {
  try {
    await seedSports();
    console.log('✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

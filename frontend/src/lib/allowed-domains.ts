/**
 * Email domain allowlist for Music Monitor
 * Only users with email addresses from these domains can create accounts
 */

export const ALLOWED_DOMAINS = {
  // Educational institutions - top music schools only
  educational: [
    // The Big 3 Music Schools
    'berklee.edu',        // Berklee College of Music - Indy's school!
    'nyu.edu',           // NYU Steinhardt, Clive Davis Institute
    'ucla.edu',          // UCLA Herb Alpert School of Music
    'g.ucla.edu',        // UCLA Google Apps accounts
    'juilliard.edu',    // The Juilliard School
    'curtis.edu',       // Curtis Institute
    'icmp.ac.uk',       // UK school (international)
    
    // Other top music programs (add more as requested)
    // Students from other schools can email indy@sagerock.com to get added
  ],

  // Major record labels
  recordLabels: [
    // Universal Music Group
    'universalmusic.com',
    'umusic.com',
    'capitolrecords.com',
    'def-jam.com',
    'interscope.com',
    'republicrecords.com',
    'islandrecords.com',
    'motown.com',
    
    // Sony Music
    'sonymusic.com',
    'sonymusic.co.uk',
    'columbiarecords.com',
    'epicrecords.com',
    'rca.com',
    'arista.com',
    
    // Warner Music Group
    'warnermusic.com',
    'wmg.com',
    'atlanticrecords.com',
    'elektra.com',
    'parlophone.com',
    
    // Independent labels
    'subpop.com',
    'mergerecords.com',
    'matadorrecords.com',
    'domino-music.com',
    '4ad.com',
    'xl-recordings.com',
    'warp.net',
    'ninjatune.net',
    'stonesrecordings.com',
    'secretlygroup.com',
    'beggarsgroupdigital.com',
    
    // Distribution & Services
    'theorchard.com',
    'cdbaby.com',
    'distrokid.com',
    'tunecore.com',
    'awal.com',
    'empire.com',
    'stem.is',
    'unitedmasters.com',
  ],

  // Music industry companies
  musicIndustry: [
    // Streaming platforms
    'spotify.com',
    'apple.com',
    'tidal.com',
    'deezer.com',
    'soundcloud.com',
    'bandcamp.com',
    'youtube.com',
    'google.com',
    
    // Music media & journalism
    'pitchfork.com',
    'rollingstone.com',
    'billboard.com',
    'nme.com',
    'stereogum.com',
    'consequence.net',
    'npr.org',
    'kexp.org',
    'kcrw.org',
    'bbc.co.uk',
    'bbc.com',
    
    // Music business
    'livenation.com',
    'aegpresents.com',
    'caa.com',
    'uta.com',
    'wmeagency.com',
    'paradigmagency.com',
    'primarytalent.com',
    'ascap.com',
    'bmi.com',
    'sesac.com',
    'sagerock.com'
    
    // Music tech
    'soundcharts.com',
    'chartmetric.com',
    'musicbusinessworldwide.com',
    'hypebot.com',
  ],

  // Specific invited organizations (add partners here)
  invited: [] as string[]
};

/**
 * Check if an email domain is allowed
 */
export function isEmailAllowed(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  
  if (!domain) return false;

  // Check if it's an approved educational domain
  if (ALLOWED_DOMAINS.educational.includes(domain)) {
    return true;
  }

  // Check record labels
  if (ALLOWED_DOMAINS.recordLabels.includes(domain)) {
    return true;
  }

  // Check music industry companies
  if (ALLOWED_DOMAINS.musicIndustry.includes(domain)) {
    return true;
  }

  // Check invited organizations
  if (ALLOWED_DOMAINS.invited.includes(domain)) {
    return true;
  }

  return false;
}

/**
 * Get a user-friendly message for why an email is not allowed
 */
export function getAccessDeniedMessage(email: string): string {
  const domain = email.split('@')[1];
  
  return `
    Music Monitor is currently available exclusively for music industry professionals and students at select schools.
    
    Accounts are limited to:
    • Students at Berklee, NYU, and UCLA (more schools coming soon)
    • Employees at record labels and music companies
    • Verified music industry professionals
    
    The email domain "${domain}" is not currently authorized.
    
    If you're a music student or industry professional, you can request access by emailing:
    indy@sagerock.com with proof of your industry or educational affiliation.
    
    Students: Please use your school email and mention your music program.
  `;
}

/**
 * Get list of example allowed domains for display
 */
export function getExampleDomains(): string[] {
  return [
    'berklee.edu',
    'nyu.edu',
    'ucla.edu',
    'universalmusic.com',
    'sonymusic.com',
    'spotify.com',
    'atlanticrecords.com',
    'warnermusic.com',
  ];
}
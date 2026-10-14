import fs from 'node:fs';
const file='src/locales/en.json';
const ui=JSON.parse(fs.readFileSync(file,'utf8'));
const issue='https://github.com/jjasnek-ops/just-dance-decades-of-hits-guide/issues';
const section=(heading,text,links=[])=>({heading,text,links});
ui.legalPages={
about:{intro:'Just Dance Decades of Hits Guide is an independent English-language reference site. Unofficial Fan Guide — Not affiliated with or endorsed by Ubisoft or the Just Dance rightsholders.',sections:[
section('What this guide covers','The 35-song official launch catalogue, platform release dates, Adventure Mode rules, multiplayer, supported control facts and library entitlements.'),
section('How information is checked','We link the sources used for each page and distinguish publication, substantive modification and fact-check dates. Official Ubisoft and Nintendo material is the primary basis. Unverified reward thresholds, difficulty ratings and regional variations are not presented as fact.'),
section('Editorial scope','These are researched guides, not claims of firsthand playtesting. Spelling corrections and source disagreements are explained. The launch review date is October 14, 2026; articles change only when evidence changes.'),
section('Corrections','Send a source URL and the affected page in a repository issue. Please do not include personal information, account details or credentials.',[{label:'Report an editorial correction',href:issue}])]},
'privacy-policy':{intro:'This notice describes the current launch configuration of this static guide. Last updated October 14, 2026.',sections:[
section('Accounts and submissions','Reading the guide requires no account. The site has no login, purchase, upload, email capture or contact form. Song filtering and Pagefind searches run in your browser; this site does not provide an analytics endpoint to collect those queries.'),
section('Cookies and browser storage','Advertisements, Google Analytics, Cloudflare Web Analytics and third-party comments are disabled. Theme preference and helpfulness feedback may be stored locally by template features. Local storage can be cleared through browser settings.'),
section('Hosting and request processing','When deployed, Cloudflare delivers the site and may process request data such as IP addresses for network delivery, security and performance. The hosting provider has its own policies.',[{label:'Cloudflare privacy policy',href:'https://www.cloudflare.com/privacypolicy/'}]),
section('External links','Following a Ubisoft, Nintendo, artist or GitHub link leaves this site. Their privacy policies apply there. We embed no song audio, music videos or third-party player at launch.'),
section('Future changes and privacy contact','This notice must be revised before enabling analytics, advertising or other data collection. For a question about the guide, use the repository issue channel without submitting private account information.',[{label:'Contact the guide maintainers',href:issue}])]},
'terms-of-service':{intro:'This website provides independent informational guides about Just Dance: Decades of Hits. Last updated October 14, 2026.',sections:[
section('Using the guide','Information can change with updates, regions, editions and subscriptions. Each guide identifies its checked scope and sources. Check the official store and support documentation when deciding what to purchase or which equipment to use.'),
section('Purchases and game access','This site does not sell the game or provide account access, downloads, music files or subscriptions. Purchases and game use are governed by the relevant publisher and platform terms.'),
section('Editorial limitations','We do not guarantee leaderboard outcomes, performance, availability of all regional content or future releases. Where a mechanic is not verified, the guide states that limit.'),
section('Content and corrections','Original editorial text and site artwork are ours; game, music and platform intellectual property belongs to its rightsholders. Report specific errors with supporting sources.',[{label:'Copyright and trademark notice',href:'/copyright/'},{label:'Editorial correction channel',href:issue}])]},
copyright:{intro:'Unofficial Fan Guide — Not affiliated with or endorsed by Ubisoft or the Just Dance rightsholders.',sections:[
section('Names and ownership','Just Dance and Ubisoft names and trademarks belong to their respective owners. Artist names and song titles are used to identify catalogue facts. No ownership of music, choreography, game characters or publisher artwork is claimed.'),
section('Materials on this website','The launch site uses original abstract record artwork, generated editorial covers and factual song credits. It contains no copied lyrics, song audio, official logo, commercial key art or dance-video downloads. A fan-site disclaimer does not grant a licence to reuse protected material.'),
section('Template attribution','The engineering template is AnvilWiki v2.37.0, by PNGTRID and contributors, used under its MIT licence. The original licence is retained in the repository.',[{label:'AnvilWiki source and MIT licence',href:'https://github.com/PNGTRID/AnvilWiki'},{label:'This site source',href:'https://github.com/jjasnek-ops/just-dance-decades-of-hits-guide'}]),
section('Rights or takedown requests','Use the repository issue channel to identify the material, affected URL, your rights and a suitable reply method. Do not post confidential documents or private identifiers in a public issue.',[{label:'Rights and editorial contact',href:issue}])]},
contact:{intro:'For this independent guide, use the repository issue channel. Ubisoft’s support team is a separate service for game and account issues.',sections:[
section('Corrections and rights requests','Include the page URL, a specific description and a source where possible. Keep account details, payment information and private identifiers out of public issues.',[{label:'Guide issues and corrections',href:issue},{label:'Copyright notice',href:'/copyright/'}]),
section('Official game resources','The links below belong to the game publisher. They do not represent the maintainers of this guide.',[{label:'Official game website',href:'https://www.ubisoft.com/en-us/game/just-dance/decades-of-hits'},{label:'Ubisoft Help',href:'https://www.ubisoft.com/en-us/help'}])]}
};
fs.writeFileSync(file,JSON.stringify(ui,null,2)+'\n');
for(const page of ['about','privacy-policy','terms-of-service','copyright','contact']) {
const route=`src/pages/${page}.astro`;
fs.writeFileSync(route,fs.readFileSync(route,'utf8').replaceAll('2026-08-11','2026-10-14'));
}
fs.writeFileSync('src/components/layout/LegalContent.astro',`---
import { defaultLocale, type Locale } from '~/i18n/routing';
import { getUi } from '~/i18n/ui';
interface Props {
  page: 'about' | 'privacy-policy' | 'terms-of-service' | 'copyright' | 'contact';
  locale?: Locale;
}
const { page, locale = defaultLocale } = Astro.props;
const content = getUi(locale).legalPages[page];
---
<p>{content.intro}</p>
{content.sections.map(section => <section>
  <h2>{section.heading}</h2>
  <p>{section.text}</p>
  {section.links.length > 0 && <ul>{section.links.map(link => <li><a href={link.href}>{link.label}</a></li>)}</ul>}
</section>)}
`);
console.log('Configured truthful legal/about/contact copy.');

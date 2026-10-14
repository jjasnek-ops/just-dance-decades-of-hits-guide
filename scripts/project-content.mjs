import fs from 'node:fs';
import path from 'node:path';
const write = (file, value) => { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file,value); };
const source = 'https://news.ubisoft.com/en-us/article/4C0I0ak0v6u63UZkEdVaEl/just-dance-decades-of-hits-out-now-with-mamma-mia-by-abba-wannabe-by-spice-girls-manchild-by-sabrina-carpenter-and-more';
const reveal = 'https://news.ubisoft.com/en-us/article/191jAgcwK3nXbzliTZwSOg/just-dance-decades-of-hits-coming-on-october-13';
const product = 'https://www.ubisoft.com/en-us/game/just-dance/decades-of-hits';
const nintendo = 'https://www.nintendo.com/us/store/products/just-dance-decades-of-hits-switch/';
const switch2 = 'https://www.nintendo.com/us/whatsnew/step-into-a-brand-new-just-dance-experience/';
const patch = 'https://www.ubisoft.com/en-gb/news/ignt.63908/version-27-0-1-patch-notes-article';
const help = 'https://www.ubisoft.com/en-us/help/just-dance-2025/all-topics?platform=Nintendo+Switch';
const groups = {
  '1970s':[['Mamma Mia','ABBA'],['Come and Get Your Love','The Heartliners'],['ABC','Groove Century'],['Crocodile Rock','Elton John'],['The Singing Garden','Hyacinth']],
  '1980s':[["It's Tricky",'Run-DMC'],['Uptown Girl','Billy Joel'],['Into the Groove','Madonna'],['Jump','Metal Russell'],['Celebration','Equinox Stars']],
  '1990s':[['Wannabe','Spice Girls'],['Just A Girl','No Doubt'],['Around the World','Daft Punk'],['Sing Hallelujah!','Dr. Alban'],['Coconut','SMiLE.dk']],
  '2000s':[['Stronger','Britney Spears'],['Bye Bye Bye','*NSYNC'],['No Scrubs','TLC'],['Feel Good Inc.','Gorillaz'],['Starlight','The Supermen Lovers feat. Mani Hoffman'],['In Too Deep','Sum 41']],
  '2010s':[['Turn Down for What','DJ Snake & Lil Jon'],['Danza Kuduro','Don Omar feat. Lucenzo'],['Hello','Martin Solveig & Dragonette'],['Santa Tell Me','Ariana Grande'],['Give Me Everything','Pitbull feat. Ne-Yo, Afrojack and Nayer']],
  '2020s':[['Manchild','Sabrina Carpenter'],['NUEVAYoL','Bad Bunny'],['Midnight Sun','Zara Larsson'],['drop dead','Olivia Rodrigo'],['MORE & MORE','TWICE'],['HOT TO GO!','Chappell Roan'],['Across All Time','Lyra Gigavolt'],['Supersonic','Lyra Gigavolt'],['Hi Lyfe','Cult of Sound']]
};
const songs = Object.entries(groups).flatMap(([decade,tracks])=>tracks.map(([title,artist])=>({title,artist,decade,source_url:source,checked_at:'2026-10-14',grade:'A',scope:'Official launch article, English US; regional catalogue not independently tested'})));
if(songs.length!==35 || new Set(songs.map(s=>s.title)).size!==35) throw Error('Catalogue count/uniqueness failed');
write('src/data/song-catalogue.json',JSON.stringify(songs,null,2)+'\n');
const links = '\n\n## Where can I find related answers?\n\nUse the [full song list](/songs/song-list/), compare [platforms and release dates](/guides/platforms/), or read the [Adventure Mode guide](/guides/adventure-mode/). For input and connectivity, see [how to play and offline requirements](/guides/how-to-play/) and [multiplayer](/guides/multiplayer/).';
function article(category,slug,title,description,summary,body,version='Launch information') {
  const file = `src/content/wiki/en/${category}/${slug}.mdx`;
  if(fs.existsSync(file)) throw Error(`Refusing to overwrite authored article ${file}`);
  write(file,`---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\ncategory: ${category}\ndate: 2026-10-14\nlastModified: 2026-10-14\nauthor: "Decades Guide Editorial"\ntags: ["just-dance", "launch-guide", "${category}"]\ngameVersion: ${JSON.stringify(version)}\nsummary: ${JSON.stringify(summary)}\n---\n\n${body}\n\n**Sources last checked:** October 14, 2026. **Published and last substantively modified:** October 14, 2026. This is an unofficial guide; platform and region restrictions can change.${links}\n`);
}
for(const category of ['songs','guides']) {
  const scaffold=`src/content/wiki/en/${category}/getting-started.mdx`;
  if(fs.existsSync(scaffold) && fs.readFileSync(scaffold,'utf8').includes('Replace this scaffold')) fs.unlinkSync(scaffold);
}
article('songs','song-list','Just Dance: Decades of Hits Song List — All 35 Tracks','Browse all 35 Just Dance: Decades of Hits songs by title, artist and official decade group. Search and filter the Ubisoft launch tracklist.',
  'Just Dance: Decades of Hits includes 35 songs in Ubisoft’s launch tracklist, grouped from the 1970s to the 2020s. Search by song or artist and filter by the official decade below. These are base-release tracks; extra editions, Music Packs and Just Dance+ can expand your shared library.',
`import FilterTable from '~/components/article/FilterTable.astro';
import catalogue from '~/data/song-catalogue.json';

The **complete 35-song launch tracklist** is below, checked against [Ubisoft’s October 13 launch announcement](${source}). This table counts unique song titles in that announcement, rather than alternate routines or everything you may see in a combined library.

## Which songs are in the base release?

Search a title or artist, choose a decade, or sort titles A–Z. The full table is in the page HTML, so it remains readable without JavaScript. Decades reproduce Ubisoft’s launch grouping, not an independently researched original release year.

<FilterTable headers={['Song', 'Credited artist', 'Official decade group']} rows={catalogue.map(song => [song.title, song.artist, song.decade])} filterColumn={2} labels={{search:'Find a song or artist',placeholder:'Try ABBA, Manchild or Gorillaz…',filter:'Decade',all:'All decades',sort:'Order',original:'Official order',ascending:'Title A–Z',reset:'Reset',count:'songs shown',empty:'No matching songs. Try another title, artist or decade.',caption:'35 base-release songs · Ubisoft launch list · checked October 14, 2026'}} />

## How many songs are in each decade?

| Official group | Songs |
| --- | ---: |
| 1970s | 5 |
| 1980s | 5 |
| 1990s | 5 |
| 2000s | 6 |
| 2010s | 5 |
| 2020s | 9 |
| **Total** | **35** |

## Why is No Scrubs under the 2000s?

Ubisoft’s launch article places **No Scrubs** in the 2000s, although earlier promotion associated it with the 1990s. We retain the launch article’s group as the source of this filter. Treat it as the publisher’s grouping; this table does not assert that every recording first released in the displayed decade.

## Are these the original artists and recordings?

Read the credited artist carefully. For example, Ubisoft lists **Come and Get Your Love** by **The Heartliners**, **ABC** by **Groove Century**, and **Jump** by **Metal Russell**. We preserve those game credits instead of substituting a better-known original performer. An original recording is not promised by a song title alone.

Ubisoft’s article spells the Hello artist “Martein Solveig” and the Starlight artist “The Superman Lovers.” The display uses **Martin Solveig** and **The Supermen Lovers**, matching [Martin Solveig’s own Hello biography](https://martinsolveig.com/79-2/) and the [independently reported launch list](https://nintendoeverything.com/just-dance-decades-of-hits-song-list-announced/). This is a spelling correction, not a different song or performer. Alternate routines are excluded because the launch announcement does not enumerate them.

## Do I need Adventure Mode to unlock these songs?

No. [Ubisoft’s version 27.0.1 notes](${patch}) say the included songs can be reached through the Song Library regardless of Adventure Mode progress. The story has its own progression and rewards. Read the [Adventure Mode rules](/guides/adventure-mode/) before looking for an unlock walkthrough.

## Why does my library show a different total?

Purchased editions from 2023–2026, purchased Music Packs and an active Just Dance+ subscription can add songs to the shared library. They are separate entitlements and are not included in the 35-song count here. See [base game versus subscription](/guides/library-and-subscription/). This list follows the English US official launch article; we have not independently tested every regional storefront or licence variation.`);

article('guides','platforms','Just Dance: Decades of Hits Platforms & Switch 2 Release','Check Just Dance: Decades of Hits launch dates for Switch, PS5, Xbox Series X|S and Switch 2, plus the free Switch 2 upgrade distinction.',
 'Just Dance: Decades of Hits released on October 13, 2026 for Nintendo Switch, PlayStation 5 and Xbox Series X|S. The dedicated Nintendo Switch 2 edition is scheduled for November 10. Nintendo also lists the existing Switch version as supported on Switch 2, with a free upgrade arriving on November 10.',
`Just Dance: Decades of Hits is available on **Nintendo Switch, PS5 and Xbox Series X|S** as of October 14, 2026. The dedicated **Switch 2 edition is scheduled for November 10, 2026**. [Ubisoft’s launch announcement](${source}) and [Nintendo’s launch news](${switch2}) agree on that distinction.

## Which platform releases on which date?

| Platform | Official date | Position as of October 14, 2026 |
| --- | --- | --- |
| Nintendo Switch | October 13, 2026 | Released |
| PlayStation 5 | October 13, 2026 | Released |
| Xbox Series X and Series S | October 13, 2026 | Released |
| Nintendo Switch 2 dedicated edition | November 10, 2026 | Upcoming |

These dates follow official English US launch coverage. Check the linked store for the exact edition and availability in your purchasing region. We have not established a release on PC, PS4 or Xbox One for this title; a series release on an older system does not establish support here.

## Can I play the Switch version on Switch 2 now?

Nintendo’s [US Switch product page](${nintendo}) marks Switch 2 compatibility as supported, with game behavior consistent with Nintendo Switch. That backward-compatible release is distinct from the dedicated Switch 2 version due November 10.

Nintendo says Switch 2 owners can update their Switch game **for free on November 10**, gaining enhanced visuals. An internet connection is required to obtain that update. Do not interpret the future upgrade as already delivered or assume it grants unspecified camera or controller features.

## What should I check before buying?

1. Confirm the store says **Just Dance: Decades of Hits**; Just Dance 2026 Edition is a different release.
2. Match the platform, region and edition to your console and account.
3. Check supported input and internet requirements in our [how-to-play guide](/guides/how-to-play/).
4. Review the [35 base songs](/songs/song-list/) before comparing subscription or bundle contents.

The [official Ubisoft product page](${product}) provides current purchase links. Our site receives no affiliate commission from these links.`);

article('guides','adventure-mode','Just Dance: Decades of Hits Adventure Mode — Rules & Rewards','Understand the six Adventure Mode worlds, local co-op, separate progression and song access in Just Dance: Decades of Hits, using official patch notes.',
 'Adventure Mode follows Lyra Gigavolt through six decade-themed game boards to rescue her father. Ubisoft confirms song challenges, quizzes, sorting mini-games, local play for one to six players and unlockable rewards. Its progression is separate from standard scores, and base songs remain available without finishing the story.',
`**Adventure Mode is a story journey through six decade-themed game boards**, following Lyra Gigavolt as she searches for her father. The [official version 27.0.1 notes](${patch}) describe its play rules; the [launch announcement](${source}) confirms the six worlds and rewards. This page explains documented mechanics rather than inventing a stage-by-stage walkthrough.

## What do you do in Adventure Mode?

Ubisoft confirms three activity types: **song challenges**, **quizzes** and **sorting mini-games**. The six boards draw on different musical decades. These activities form a progression system with unlockable rewards, but the official sources we checked do not provide every board’s tasks, reward name or completion threshold.

| Confirmed feature | Meaning for your session |
| --- | --- |
| Six decade-themed boards | A structured story route across musical eras |
| Song challenges | Dancing is part of the story activity mix |
| Quizzes and sorting mini-games | The mode includes activities beyond dancing |
| Local co-op for 1–6 players | Play alone or with people on one console |
| Separate progression | Story progress does not replace main-game progress |

## Do story scores count toward leaderboards?

No. Ubisoft explicitly separates Adventure Mode progression from the main game. Scores earned in Adventure Mode **do not count toward standard leaderboards or personal high scores**. If your goal is a normal song high score, use the main Song Library rather than assuming a story performance transfers.

## Must I unlock the song list by completing the story?

No. Ubisoft says **all included songs remain accessible in the Song Library regardless of Adventure Mode progress**. You can browse the [base-release tracklist](/songs/song-list/) without completing the adventure. Story rewards are a separate issue from accessing those 35 song titles.

## Which rewards and unlock conditions are verified?

The existence of exclusive rewards is official. A complete reward table and its exact conditions are **not verified** in our checked sources, so we do not publish a speculative unlock checklist. We also do not assign invented world names, boss requirements or star thresholds.

## Does Just Dance+ alone include Adventure Mode?

Nintendo describes Adventure Mode as **only available with Just Dance: Decades of Hits** on its [product page](${nintendo}). Do not infer access from an active Just Dance+ subscription or another edition in the shared client. See [library entitlements](/guides/library-and-subscription/) and [local multiplayer](/guides/multiplayer/) for the related distinctions.`, '27.0.1 notes');

article('guides','multiplayer','Just Dance: Decades of Hits Multiplayer — Local & Online','Check the six-player local limit, Adventure co-op, Dancer Cards and Switch online requirements for Just Dance: Decades of Hits.',
 'Just Dance: Decades of Hits supports up to six local dancers, and Adventure Mode supports local play for one to six players. Ubisoft’s notes say Dancer Cards share progression, rewards and scores. Nintendo’s US store separately lists one to six online players; online requirements differ from a local session.',
`**Up to six people can dance locally** in Just Dance: Decades of Hits, according to [Ubisoft’s launch article](${source}). [Version 27.0.1 notes](${patch}) also confirm local Adventure Mode support for one to six players. Plan controllers for the number of dancers rather than assuming a console purchase equips all six.

## How many people can play together?

| Session | Documented limit | Source scope |
| --- | --- | --- |
| Local dancing | Up to 6 players | Ubisoft launch announcement |
| Adventure Mode local co-op | 1–6 players | Ubisoft 27.0.1 notes |
| Nintendo Switch online | 1–6 players | Nintendo US product listing |

The [Nintendo product page](${nintendo}) lists local and online counts separately. We have not verified every online mode’s cross-platform rules or account invitations on every console, so this page does not claim a universal online setup procedure.

## Can everyone use a phone?

Ubisoft promotes smartphone controller support for local play. Additional accessories may still be needed for your chosen input setup; Nintendo’s launch news includes that qualification. See [controller and offline requirements](/guides/how-to-play/) before mixing phones and Joy-Con controllers.

## Does each Dancer Card have independent progress?

No. The official patch notes say **progression, rewards and scores are shared across all Dancer Cards**. Players can create, rename and customize several cards; local guests can choose existing cards or generated guest profiles during a session. Several profiles do not establish separate save progression.

## What changes when I play online on Switch?

Nintendo’s product page lists Nintendo Switch Online for online play. Ubisoft’s [current help listing](${help}) names a linked Ubisoft/platform account and an active console online subscription for multiplayer features, and treats Just Dance+ content separately. Those online requirements should not be confused with the six-player local limit. Check current platform-specific subscription wording in the store before paying.

For a party playlist, use the [song filter](/songs/song-list/). For the co-op story rules and score limitations, use [Adventure Mode](/guides/adventure-mode/).`);

article('guides','how-to-play','How to Play Just Dance: Decades of Hits — Controls & Offline','Start with the right release, find your songs and understand phone controls and Nintendo Switch offline downloads in Just Dance: Decades of Hits.',
 'Start with a supported console and the correct Decades of Hits entitlement, then choose a song from the shared Song Library. Ubisoft confirms phone controller support. On Nintendo Switch, its updated help documentation allows downloaded songs offline using Joy-Con controllers only; that does not establish offline phone support or support on other consoles.',
`Start by checking your **console, game entitlement and input method**, then choose a track in the Song Library. Ubisoft confirms smartphone controller support in the [launch announcement](${source}). The verified offline steps below specifically apply to **Nintendo Switch**, based on [Ubisoft help updated October 13, 2026](${help}).

## How do I find my Decades of Hits songs?

1. Confirm your console is one of the [supported platforms](/guides/platforms/), and your purchased content is Decades of Hits.
2. Open the shared Just Dance Song Library. Purchased releases can appear together in the same client.
3. Search for a song title or artist. Version 27.0.1 restored **Sort by Opus** and added a retractable filter panel.
4. Select a base song and follow the input connection instructions displayed by your game and controller app.

You do not need to finish the story to reach the base songs. See the [complete song list](/songs/song-list/) and [Adventure Mode](/guides/adventure-mode/) for those distinctions. We have not independently verified app pairing screens or minimum OS versions for this release, so we do not prescribe an invented pairing code or device specification.

## Which control methods are actually confirmed?

| Method | What the checked source establishes |
| --- | --- |
| Smartphone controller | Ubisoft confirms use in Decades of Hits |
| Nintendo Switch Joy-Con | Ubisoft’s offline guide requires this input for offline play |
| Other controller or camera combinations | Full release-specific compatibility matrix not independently verified here |

Camera support in another Just Dance edition does not establish all supported phones or modes in this one. For compatibility errors, use the [official Ubisoft resources](${product}) and your storefront’s current support links.

## How do I play offline on Nintendo Switch?

Ubisoft’s help explicitly includes Decades of Hits in Nintendo Switch offline support. **Download the songs while online first**, then use **Joy-Con controllers** for the offline session:

1. Connect to the internet and open **Settings** from the main menu.
2. Choose **Local Storage**, then **Download Songs**.
3. Select **Download** to confirm.
4. Once downloaded, access the tracks from **Songs Library** when offline.

These labels come from the official Switch help instructions. Offline use is limited to Joy-Con according to that same source. We have not verified an equivalent offline process for PS5, Xbox Series X|S, or the upcoming dedicated Switch 2 edition; do not apply this Switch-specific recipe to them.

## Which mode should I pick first?

For direct song selection, use the library. For a story route, use Adventure Mode. Ubisoft says **Party Mode** changes rules between rounds, while **Workout Mode** tracks calories with each dance. Calorie tracking is a game feature, not a medical measurement. If you are setting up a group, check [multiplayer limits](/guides/multiplayer/) and the input requirements before starting.`, '27.0.1 / Switch');

article('guides','library-and-subscription','Just Dance: Decades of Hits vs Just Dance+ — Library Access','Separate the 35-song base release, purchased 2023–2026 editions, Music Packs and Just Dance+ in the shared Just Dance library.',
 'Decades of Hits has 35 songs in its official launch list. Songs from owned 2023–2026 editions, purchased Music Packs and an active Just Dance+ subscription can appear in the shared library. Seeing content in one menu does not mean all of those entitlements are bundled with the base release or interchangeable.',
`The **35-song Decades of Hits release** and **Just Dance+** are different sources of content. [Ubisoft’s launch announcement](${source}) explains that owned editions, purchased Music Packs and an active subscription can share a library. One menu does not mean one purchase unlocks everything.

## What belongs to the base song count?

The [35 titles in the launch tracklist](/songs/song-list/) are the count supported by Ubisoft’s announcement. This guide does not add alternate choreographies to that number or include the subscription catalogue. Regional availability and edition-specific extras should be checked against the actual store listing.

| Content source | What the official announcement says |
| --- | --- |
| Decades of Hits | 35 songs in its launch tracklist |
| Owned Just Dance 2023–2026 editions | Their songs are accessible together on the same console |
| Purchased Music Packs | Their purchased songs join that library |
| Active Just Dance+ subscription | Subscription songs can also appear there |

## Do I need to switch games to use earlier purchases?

Ubisoft’s [September announcement](${reveal}) says owners can access their owned 2023–2026 songs in one place **on the same console**, without separate menus or switching games. We retain that console qualification rather than promising all purchases transfer between different platforms or accounts.

## Does Just Dance+ grant the new Adventure Mode?

Nintendo’s [Decades of Hits listing](${nintendo}) labels Adventure Mode as available only with this release. Do not assume a subscription unlocks the mode or that owning a previous edition grants it. The [Adventure guide](/guides/adventure-mode/) explains its separate progression.

## Why does the Nintendo store say I already own the game?

Nintendo’s publisher notification says an “already own” warning may refer to previously downloaded or purchased Just Dance content, including the Free Experience and earlier editions. It does **not** necessarily refer to Decades of Hits. Compare the specific content entitlement in your account before buying; the shared client and the paid song release are distinct.

## Which edition is the best value?

We have not verified all current regional Standard, Deluxe, Ultimate or retail bundle entitlements and prices. An accurate value comparison needs the exact store, region, subscription duration and extras. Use the [official product page](${product}) to reach the relevant store, then compare its itemized content with the [platform release dates](/guides/platforms/). No assumed trial length or future subscription catalogue is promised here.`);

const ui = JSON.parse(fs.readFileSync('src/locales/en.json','utf8'));
ui.site.name='Just Dance Decades of Hits Guide';
ui.shared.wikiIntro='An independent reference for the song catalogue, Adventure Mode and platform differences. Facts are linked to official sources and dated.';
ui.shared.codesFaq=[];
ui.nav.songs='Songs'; ui.nav.guides='Guides';
ui.overview={songs:{overviewTitle:'Song List & Tracklist',overviewDescription:'Search the 35-song Just Dance: Decades of Hits launch tracklist with artist and decade filters, source notes and base-release scope.'},guides:{overviewTitle:'Just Dance: Decades of Hits Guides',overviewDescription:'Official-source answers about platforms, Adventure Mode, multiplayer, controllers, offline access and Just Dance+ library differences.'}};
ui.home.meta={title:'Just Dance: Decades of Hits — Song List & Guides',description:'All 35 launch songs, searchable by title, artist and decade. Explore Adventure Mode, platform dates and controller requirements in this unofficial guide.'};
ui.home.hero={badge:'UNOFFICIAL FAN GUIDE · LAUNCH CHECKED OCT 14, 2026',title:'Just Dance: Decades of Hits',description:'35 songs. Six musical decades. Find your next dance, explore the new Adventure Mode and check which version works with your console.',ctaPrimary:'Explore all 35 songs',ctaSecondary:'Platform & Switch 2 guide',ctaPrimaryHref:'/songs/song-list/',ctaSecondaryHref:'/guides/platforms/',image:'/images/record-art.svg',imageAlt:'Original illustrated vinyl record with concentric rings representing six musical decades',videoId:''};
ui.home.start={badge:'YOUR NEXT DANCE',title:'Start with what you came for',cards:[
{number:'01 / TRACKLIST',title:'All 35 songs',description:'Search titles and artists. Filter the official decade groups.',icon:'lucide:music',href:'/songs/song-list/'},
{number:'02 / STORY',title:'Adventure Mode',description:'Six worlds, co-op and what progression actually unlocks.',icon:'lucide:compass',href:'/guides/adventure-mode/'},
{number:'03 / CONSOLES',title:'Platforms & Switch 2',description:'October 13 launch vs the November 10 Switch 2 edition.',icon:'lucide:gamepad-2',href:'/guides/platforms/'},
{number:'04 / FIRST SESSION',title:'Controls & offline',description:'Phone support and the verified Switch download steps.',icon:'lucide:smartphone',href:'/guides/how-to-play/'}]};
ui.home.updates={title:'The launch essentials'};
ui.home.popular={badge:'AT A GLANCE',title:'Know before you dance',quickLinks:[{label:'35 base-release songs',href:'/songs/song-list/'},{label:'Up to 6 local dancers',href:'/guides/multiplayer/'},{label:'Adventure scores are separate',href:'/guides/adventure-mode/'},{label:'Base songs vs Just Dance+',href:'/guides/library-and-subscription/'}]};
ui.home.explore={title:'Six decades. One collection.',description:'The game groups its launch songs by era. These are official game groups, not original recording years.',modules:[
{order:1,name:'From disco to the dance floor',description:'A filterable catalogue with the credited game artists and every launch song.',href:'/songs/song-list/',displayType:'labeled-cards',highlights:[{label:'1970s',detail:'Mamma Mia · Crocodile Rock'},{label:'1980s',detail:"Uptown Girl · It’s Tricky"},{label:'1990s',detail:'Wannabe · Around the World'},{label:'2000s',detail:'Bye Bye Bye · Feel Good Inc.'},{label:'2010s',detail:'Danza Kuduro · Turn Down for What'},{label:'2020s',detail:'Manchild · HOT TO GO!'}]},
{order:2,name:'A new journey through time',description:'Join Lyra Gigavolt. The story offers its own progress and exclusive rewards.',href:'/guides/adventure-mode/',displayType:'steps',highlights:[{label:'01',detail:'Explore six decade-themed boards'},{label:'02',detail:'Dance, answer quizzes and sort'},{label:'03',detail:'Play locally with 1–6 dancers'},{label:'04',detail:'Keep story progress separate from high scores'}]},
{order:3,name:'Two Nintendo release dates',description:'Understand the current Switch release and the upcoming dedicated Switch 2 edition.',href:'/guides/platforms/',displayType:'timeline',highlights:[{label:'OCT 13, 2026',detail:'Switch · PS5 · Xbox Series X|S released'},{label:'OCT 14, 2026',detail:'Official sources checked for this guide'},{label:'NOV 10, 2026',detail:'Dedicated Switch 2 version scheduled; free Switch upgrade announced'}]},
{order:4,name:'Build your party',description:'Choose input methods, understand profiles and separate base songs from extra content.',href:'/guides/multiplayer/',displayType:'labeled-cards',highlights:[{label:'Local play',detail:'Up to six people on one console'},{label:'Dancer Cards',detail:'Progress, rewards and scores are shared'},{label:'Just Dance+',detail:'An active subscription is a separate entitlement'}]}
]};
ui.home.closingCta={title:'Your next favorite is in the tracklist.',description:'Start with the songs, then choose a mode. Every guide links its sources and states what is still unverified.',primary:'Browse the guides',secondary:''};
ui.home.faq={title:'Just Dance: Decades of Hits FAQ',description:'Source-checked answers about the 35-song release, launch dates, story mode and multiplayer. Checked October 14, 2026.',items:[
{question:'How many songs are in Decades of Hits?',answer:'Ubisoft’s October 13, 2026 launch article lists 35 songs. That is the base-release list, not the total of a combined library with earlier purchases or Just Dance+.'},
{question:'When does the dedicated Switch 2 edition release?',answer:'November 10, 2026, according to Ubisoft and Nintendo. Switch, PS5 and Xbox Series X|S launched October 13. Nintendo lists Switch backward compatibility on Switch 2 separately.'},
{question:'Do I have to finish Adventure Mode to unlock the songs?',answer:'No. Ubisoft’s 27.0.1 patch notes state that all included songs remain accessible in the Song Library regardless of Adventure Mode progress.'},
{question:'How many people can dance locally?',answer:'Up to six people. The 27.0.1 notes also confirm Adventure Mode local co-op for one to six players. Input accessories and online requirements depend on the setup.'},
{question:'Is this an official Ubisoft website?',answer:'No. This is an unofficial fan guide, not affiliated with or endorsed by Ubisoft or the Just Dance rightsholders. Its sources are Ubisoft’s launch and patch articles and Nintendo’s store and launch news.'}
]};
ui.footer.playGame='Official game website';
ui.footer.copyrightText='© 2026 Just Dance Decades of Hits Guide. Original editorial content; game and music trademarks belong to their owners.';
write('src/locales/en.json',JSON.stringify(ui,null,2)+'\n');
let site=fs.readFileSync('src/config/site.ts','utf8').replace("name: 'Just Dance Decades of Hits Guide',\n    platform:","name: 'Just Dance: Decades of Hits',\n    platform:");
site=site.replace('  // Set a real address',"  defaultAuthor: 'Decades Guide Editorial',\n  // Set a real address");
write('src/config/site.ts',site);
let nav=fs.readFileSync('src/config/navigation.ts','utf8').replace("key: 'songs', path: '/songs', icon: 'lucide:folder'","key: 'songs', path: '/songs', icon: 'lucide:music'");
write('src/config/navigation.ts',nav);
console.log('Created 6 sourced articles, 35-song dataset and complete English homepage config.');

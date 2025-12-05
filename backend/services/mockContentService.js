const NetworkContent = require('../models/NetworkContent');

// Mock content database simulating real streaming platform content
const MOCK_CONTENT_DATABASE = {
  'Netflix': [
    { title: 'Stranger Things', type: 'TV Show', genres: ['Sci-Fi', 'Horror', 'Drama'], year: 2016, rating: 8.7, description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.' },
    { title: 'Wednesday', type: 'TV Show', genres: ['Comedy', 'Horror', 'Mystery'], year: 2022, rating: 8.1, description: 'Smart, sarcastic Wednesday Addams attempts to master her emerging psychic ability at Nevermore Academy.' },
    { title: 'The Crown', type: 'TV Show', genres: ['Drama', 'History'], year: 2016, rating: 8.6, description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign.' },
    { title: 'Squid Game', type: 'TV Show', genres: ['Action', 'Thriller', 'Drama'], year: 2021, rating: 8.0, description: 'Hundreds of cash-strapped contestants accept an invitation to compete in children\'s games for a tempting prize.' },
    { title: 'Breaking Bad', type: 'TV Show', genres: ['Crime', 'Drama', 'Thriller'], year: 2008, rating: 9.5, description: 'A high school chemistry teacher turned meth manufacturer partners with a former student to secure his family\'s future.' },
    { title: 'The Witcher', type: 'TV Show', genres: ['Action', 'Adventure', 'Fantasy'], year: 2019, rating: 8.2, description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.' },
    { title: 'Ozark', type: 'TV Show', genres: ['Crime', 'Drama', 'Thriller'], year: 2017, rating: 8.5, description: 'A financial advisor drags his family from Chicago to Missouri to launder money for a drug boss.' },
    { title: 'The Umbrella Academy', type: 'TV Show', genres: ['Action', 'Comedy', 'Sci-Fi'], year: 2019, rating: 8.0, description: 'A dysfunctional family of superheroes comes together to solve the mystery of their father\'s death.' },
    { title: 'Black Mirror', type: 'TV Show', genres: ['Sci-Fi', 'Thriller', 'Drama'], year: 2011, rating: 8.8, description: 'An anthology series exploring a twisted, high-tech multiverse where humanity\'s greatest innovations clash with darkest instincts.' },
    { title: 'The Queen\'s Gambit', type: 'TV Show', genres: ['Drama'], year: 2020, rating: 8.6, description: 'Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.' },
    { title: 'Glass Onion', type: 'Movie', genres: ['Mystery', 'Comedy', 'Crime'], year: 2022, rating: 7.2, description: 'Tech billionaire Miles Bron invites his friends for a getaway on his private Greek island, but when someone turns up dead, Detective Benoit Blanc is put on the case.' },
    { title: 'The Adam Project', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2022, rating: 6.7, description: 'A time-traveling pilot teams up with his younger self and his late father to come to terms with his past while saving the future.' },
    { title: 'Red Notice', type: 'Movie', genres: ['Action', 'Comedy', 'Thriller'], year: 2021, rating: 6.3, description: 'An Interpol agent tracks the world\'s most wanted art thief.' },
    { title: 'Don\'t Look Up', type: 'Movie', genres: ['Comedy', 'Drama', 'Sci-Fi'], year: 2021, rating: 7.2, description: 'Two astronomers go on a media tour to warn humankind of a planet-killing comet hurtling toward Earth.' },
    { title: 'The Irishman', type: 'Movie', genres: ['Crime', 'Drama'], year: 2019, rating: 7.8, description: 'An epic saga of organized crime in post-war America told through the eyes of World War II veteran Frank Sheeran.' }
  ],
  'Prime Video': [
    { title: 'The Lord of the Rings: The Rings of Power', type: 'TV Show', genres: ['Adventure', 'Drama', 'Fantasy'], year: 2022, rating: 7.0, description: 'Epic drama set thousands of years before the events of J.R.R. Tolkien\'s The Hobbit and The Lord of the Rings.' },
    { title: 'The Boys', type: 'TV Show', genres: ['Action', 'Comedy', 'Crime'], year: 2019, rating: 8.7, description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.' },
    { title: 'Reacher', type: 'TV Show', genres: ['Action', 'Crime', 'Drama'], year: 2022, rating: 8.1, description: 'Jack Reacher was arrested for murder and must uncover the truth behind a major government conspiracy.' },
    { title: 'The Marvelous Mrs. Maisel', type: 'TV Show', genres: ['Comedy', 'Drama'], year: 2017, rating: 8.7, description: 'A housewife in 1958 Manhattan decides to become a stand-up comic.' },
    { title: 'Jack Ryan', type: 'TV Show', genres: ['Action', 'Drama', 'Thriller'], year: 2018, rating: 8.0, description: 'An up-and-coming CIA analyst, Jack Ryan, is thrust into a dangerous field assignment.' },
    { title: 'The Terminal List', type: 'TV Show', genres: ['Action', 'Drama', 'Thriller'], year: 2022, rating: 7.9, description: 'A Navy SEAL seeks vengeance after his entire platoon is ambushed during a covert mission.' },
    { title: 'Invincible', type: 'TV Show', genres: ['Animation', 'Action', 'Adventure'], year: 2021, rating: 8.7, description: 'An adult animated series about a teenager whose father is the most powerful superhero on the planet.' },
    { title: 'The Wheel of Time', type: 'TV Show', genres: ['Adventure', 'Drama', 'Fantasy'], year: 2021, rating: 7.2, description: 'Follows Moiraine, a member of a powerful organization, as she embarks on a dangerous journey.' },
    { title: 'Fleabag', type: 'TV Show', genres: ['Comedy', 'Drama'], year: 2016, rating: 8.7, description: 'A dry-witted woman navigates her life, career, and relationships in London.' },
    { title: 'Upload', type: 'TV Show', genres: ['Comedy', 'Sci-Fi'], year: 2020, rating: 8.0, description: 'A man is uploaded to a virtual afterlife after his untimely death.' },
    { title: 'The Tomorrow War', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2021, rating: 6.5, description: 'A family man is drafted to fight in a future war where the fate of humanity relies on his ability to confront the past.' },
    { title: 'Coming 2 America', type: 'Movie', genres: ['Comedy'], year: 2021, rating: 5.3, description: 'The African monarch Akeem learns he has a long-lost son in the United States and must return to America to meet this unexpected heir.' },
    { title: 'Without Remorse', type: 'Movie', genres: ['Action', 'Thriller', 'War'], year: 2021, rating: 5.8, description: 'An elite Navy SEAL goes on a path to avenge his wife\'s murder only to find himself inside of a larger conspiracy.' },
    { title: 'Sound of Metal', type: 'Movie', genres: ['Drama', 'Music'], year: 2019, rating: 7.7, description: 'A heavy-metal drummer\'s life is thrown into freefall when he begins to lose his hearing.' },
    { title: 'The Report', type: 'Movie', genres: ['Drama', 'History', 'Thriller'], year: 2019, rating: 7.2, description: 'Idealistic Senate staffer Daniel J. Jones investigates the CIA\'s use of torture following the 9/11 attacks.' }
  ],
  'Disney+': [
    { title: 'The Mandalorian', type: 'TV Show', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2019, rating: 8.7, description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.' },
    { title: 'Loki', type: 'TV Show', genres: ['Action', 'Adventure', 'Fantasy'], year: 2021, rating: 8.2, description: 'The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after Avengers: Endgame.' },
    { title: 'WandaVision', type: 'TV Show', genres: ['Action', 'Comedy', 'Drama'], year: 2021, rating: 7.9, description: 'Blends the style of classic sitcoms with the MCU in which Wanda Maximoff and Vision live idealized suburban lives.' },
    { title: 'Andor', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], year: 2022, rating: 8.4, description: 'Prequel series to Star Wars\' Rogue One following Cassian Andor during the five years before the film.' },
    { title: 'The Falcon and the Winter Soldier', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], year: 2021, rating: 7.2, description: 'Following the events of Avengers: Endgame, Sam Wilson and Bucky Barnes team up in a global adventure.' },
    { title: 'Moon Knight', type: 'TV Show', genres: ['Action', 'Adventure', 'Fantasy'], year: 2022, rating: 7.3, description: 'Steven Grant discovers he has dissociative identity disorder and shares a body with mercenary Marc Spector.' },
    { title: 'Obi-Wan Kenobi', type: 'TV Show', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2022, rating: 7.0, description: 'Jedi Master Obi-Wan Kenobi watches over young Luke Skywalker and evades the Empire\'s elite Jedi hunters.' },
    { title: 'Ahsoka', type: 'TV Show', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2023, rating: 7.8, description: 'After the fall of the Galactic Empire, former Jedi Knight Ahsoka Tano investigates an emerging threat.' },
    { title: 'Percy Jackson and the Olympians', type: 'TV Show', genres: ['Action', 'Adventure', 'Family'], year: 2023, rating: 7.2, description: 'Demigod Percy Jackson leads a quest across America to prevent a war among the Olympian gods.' },
    { title: 'The Bear', type: 'TV Show', genres: ['Comedy', 'Drama'], year: 2022, rating: 8.6, description: 'A young chef from the fine dining world returns to Chicago to run his family\'s sandwich shop.' },
    { title: 'Encanto', type: 'Movie', genres: ['Animation', 'Comedy', 'Family'], year: 2021, rating: 7.2, description: 'A Colombian teenage girl has to face the frustration of being the only member of her family without magical powers.' },
    { title: 'Turning Red', type: 'Movie', genres: ['Animation', 'Adventure', 'Comedy'], year: 2022, rating: 7.0, description: 'A thirteen-year-old girl turns into a giant red panda whenever she gets too excited.' },
    { title: 'Soul', type: 'Movie', genres: ['Animation', 'Adventure', 'Comedy'], year: 2020, rating: 8.0, description: 'After landing the gig of a lifetime, a New York jazz pianist suddenly finds himself trapped in a strange land.' },
    { title: 'Raya and the Last Dragon', type: 'Movie', genres: ['Animation', 'Action', 'Adventure'], year: 2021, rating: 7.3, description: 'In a realm known as Kumandra, a re-imagined Earth inhabited by an ancient civilization, a warrior named Raya is determined to find the last dragon.' },
    { title: 'Cruella', type: 'Movie', genres: ['Comedy', 'Crime'], year: 2021, rating: 7.3, description: 'A live-action prequel feature film following a young Cruella de Vil.' }
  ],
  'HBO Max': [
    { title: 'House of the Dragon', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], year: 2022, rating: 8.4, description: 'An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys.' },
    { title: 'The Last of Us', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], year: 2023, rating: 8.8, description: 'Joel and Ellie must traverse the United States in a post-apocalyptic world, 20 years after a fungal outbreak.' },
    { title: 'Succession', type: 'TV Show', genres: ['Drama'], year: 2018, rating: 8.9, description: 'The Roy family is known for controlling the biggest media and entertainment company in the world.' },
    { title: 'The White Lotus', type: 'TV Show', genres: ['Comedy', 'Drama', 'Mystery'], year: 2021, rating: 8.0, description: 'The exploits of various guests and employees at an exclusive tropical resort over the span of a week.' },
    { title: 'Euphoria', type: 'TV Show', genres: ['Drama'], year: 2019, rating: 8.3, description: 'A look at life for a group of high school students as they grapple with issues of drugs, sex, and violence.' },
    { title: 'True Detective', type: 'TV Show', genres: ['Crime', 'Drama', 'Mystery'], year: 2014, rating: 8.9, description: 'Seasonal anthology series in which police investigations unearth the personal and professional secrets of those involved.' },
    { title: 'Mare of Easttown', type: 'TV Show', genres: ['Crime', 'Drama', 'Mystery'], year: 2021, rating: 8.5, description: 'A detective in a small Pennsylvania town investigates a local murder while trying to keep her life from falling apart.' },
    { title: 'Westworld', type: 'TV Show', genres: ['Drama', 'Mystery', 'Sci-Fi'], year: 2016, rating: 8.5, description: 'At the intersection of the near future and the reimagined past, waits a world in which every human appetite can be indulged.' },
    { title: 'The Penguin', type: 'TV Show', genres: ['Crime', 'Drama'], year: 2024, rating: 8.7, description: 'Following the events of The Batman (2022), Oswald Cobblepot attempts to seize control of Gotham\'s underworld.' },
    { title: 'Peacemaker', type: 'TV Show', genres: ['Action', 'Adventure', 'Comedy'], year: 2022, rating: 8.3, description: 'Picking up where The Suicide Squad (2021) left off, Peacemaker returns home after recovering from his encounter with Bloodsport.' },
    { title: 'Dune: Part Two', type: 'Movie', genres: ['Action', 'Adventure', 'Drama'], year: 2024, rating: 8.8, description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.' },
    { title: 'Barbie', type: 'Movie', genres: ['Adventure', 'Comedy', 'Fantasy'], year: 2023, rating: 6.9, description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.' },
    { title: 'The Batman', type: 'Movie', genres: ['Action', 'Crime', 'Drama'], year: 2022, rating: 7.8, description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.' },
    { title: 'The Suicide Squad', type: 'Movie', genres: ['Action', 'Adventure', 'Comedy'], year: 2021, rating: 7.2, description: 'Supervillains Harley Quinn, Bloodsport, Peacemaker, and a collection of cons join the super-secret Task Force X.' },
    { title: 'Wonder Woman 1984', type: 'Movie', genres: ['Action', 'Adventure', 'Fantasy'], year: 2020, rating: 5.4, description: 'Diana must contend with a work colleague and businessman whose desire for extreme wealth sends the world down a path of destruction.' }
  ],
  'Hulu': [
    { title: 'The Bear', type: 'TV Show', genres: ['Comedy', 'Drama'], year: 2022, rating: 8.6, description: 'A young chef from the fine dining world returns to Chicago to run his family\'s sandwich shop.' },
    { title: 'Only Murders in the Building', type: 'TV Show', genres: ['Comedy', 'Crime', 'Mystery'], year: 2021, rating: 8.1, description: 'Three strangers share an obsession with true crime and suddenly find themselves wrapped up in one.' },
    { title: 'The Handmaid\'s Tale', type: 'TV Show', genres: ['Drama', 'Sci-Fi', 'Thriller'], year: 2017, rating: 8.4, description: 'Set in a dystopian future, a woman is forced to live as a concubine under a fundamentalist theocratic dictatorship.' },
    { title: 'The Dropout', type: 'TV Show', genres: ['Drama'], year: 2022, rating: 7.8, description: 'The story of Elizabeth Holmes and Theranos, an unbelievable tale of ambition and fame gone terribly wrong.' },
    { title: 'Reservation Dogs', type: 'TV Show', genres: ['Comedy', 'Crime', 'Drama'], year: 2021, rating: 8.2, description: 'Comedy series about four Native American teenagers growing up on a reservation in Oklahoma.' },
    { title: 'What We Do in the Shadows', type: 'TV Show', genres: ['Comedy', 'Horror'], year: 2019, rating: 8.6, description: 'A documentary-style look into the lives of vampires living on Staten Island.' },
    { title: 'The Old Man', type: 'TV Show', genres: ['Action', 'Drama', 'Thriller'], year: 2022, rating: 7.8, description: 'A former CIA officer living off the grid finds himself on the run from people who want to kill him.' },
    { title: 'Fargo', type: 'TV Show', genres: ['Crime', 'Drama', 'Thriller'], year: 2014, rating: 8.9, description: 'Various chronicles of deception, intrigue, and murder in and around frozen Minnesota.' },
    { title: 'Atlanta', type: 'TV Show', genres: ['Comedy', 'Drama'], year: 2016, rating: 8.6, description: 'Based in Atlanta, Earn and his cousin Alfred try to make their way in the world through the rap scene.' },
    { title: 'The Act', type: 'TV Show', genres: ['Crime', 'Drama'], year: 2019, rating: 7.8, description: 'DeeDee Blanchard is overprotective of her daughter, Gypsy, who is trying to escape her toxic relationship with her mother.' },
    { title: 'Palm Springs', type: 'Movie', genres: ['Comedy', 'Fantasy', 'Romance'], year: 2020, rating: 7.4, description: 'When carefree Nyles and reluctant maid of honor Sarah have a chance encounter at a wedding, things get complicated as they get stuck in a time loop.' },
    { title: 'The Princess', type: 'Movie', genres: ['Action', 'Fantasy'], year: 2022, rating: 5.4, description: 'When a beautiful, strong-willed princess refuses to wed the cruel sociopath to whom she is betrothed, she is kidnapped and locked in a remote tower.' },
    { title: 'Fire Island', type: 'Movie', genres: ['Comedy', 'Romance'], year: 2022, rating: 6.7, description: 'A group of queer best friends gather in Fire Island Pines for their annual week of love and laughter.' },
    { title: 'Prey', type: 'Movie', genres: ['Action', 'Horror', 'Sci-Fi'], year: 2022, rating: 7.2, description: 'The origin story of the Predator in the world of the Comanche Nation 300 years ago.' },
    { title: 'Not Okay', type: 'Movie', genres: ['Comedy', 'Drama'], year: 2022, rating: 6.1, description: 'A misguided young woman desperate for friends and fame fakes a trip to Paris to update her social media presence.' }
  ],
  'Apple TV+': [
    { title: 'Ted Lasso', type: 'TV Show', genres: ['Comedy', 'Drama', 'Sport'], year: 2020, rating: 8.8, description: 'American football coach Ted Lasso is hired to manage a British soccer team despite having no experience.' },
    { title: 'Severance', type: 'TV Show', genres: ['Drama', 'Mystery', 'Sci-Fi'], year: 2022, rating: 8.7, description: 'Mark leads a team whose memories have been surgically divided between their work and personal lives.' },
    { title: 'The Morning Show', type: 'TV Show', genres: ['Drama'], year: 2019, rating: 8.2, description: 'An inside look at the lives of the people who help America wake up in the morning.' },
    { title: 'For All Mankind', type: 'TV Show', genres: ['Drama', 'Sci-Fi'], year: 2019, rating: 8.0, description: 'In an alternative history, the Soviet Union beats the U.S. to the moon, and the space race continues on.' },
    { title: 'Foundation', type: 'TV Show', genres: ['Drama', 'Sci-Fi'], year: 2021, rating: 7.5, description: 'A complex saga of humans scattered on planets throughout the galaxy all living under the rule of the Galactic Empire.' },
    { title: 'Silo', type: 'TV Show', genres: ['Drama', 'Sci-Fi'], year: 2023, rating: 8.4, description: 'Men and women live in a giant silo underground with seemingly no knowledge of a world outside.' },
    { title: 'Shrinking', type: 'TV Show', genres: ['Comedy', 'Drama'], year: 2023, rating: 8.1, description: 'A grieving therapist starts to tell his clients exactly what he thinks. Ignoring his training and ethics, he finds himself making huge changes to people\'s lives.' },
    { title: 'Prehistoric Planet', type: 'TV Show', genres: ['Documentary'], year: 2022, rating: 8.6, description: 'Travel back 66 million years to when majestic dinosaurs and extraordinary creatures roamed the lands, seas, and skies.' },
    { title: 'Hijack', type: 'TV Show', genres: ['Drama', 'Thriller'], year: 2023, rating: 7.5, description: 'A plane from Dubai to London is hijacked over a 7-hour flight, while authorities on the ground scramble for answers.' },
    { title: 'Masters of the Air', type: 'TV Show', genres: ['Drama', 'War'], year: 2024, rating: 8.0, description: 'The 100th Bomb Group, the "Bloody Hundredth," of the United States Army Air Forces conduct strategic bombing missions during World War II.' },
    { title: 'CODA', type: 'Movie', genres: ['Comedy', 'Drama', 'Music'], year: 2021, rating: 8.0, description: 'As a CODA (Child of Deaf Adults) Ruby is the only hearing person in her deaf family. When her passion for singing leads her to enter a competition, she must choose between family and her dreams.' },
    { title: 'Killers of the Flower Moon', type: 'Movie', genres: ['Crime', 'Drama', 'History'], year: 2023, rating: 7.6, description: 'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one - until the FBI steps in to unravel the mystery.' },
    { title: 'Napoleon', type: 'Movie', genres: ['Action', 'Adventure', 'Biography'], year: 2023, rating: 6.5, description: 'An epic that details the checkered rise and fall of French Emperor Napoleon Bonaparte and his relentless journey to power through the prism of his addictive, volatile relationship with his wife, Josephine.' },
    { title: 'Finch', type: 'Movie', genres: ['Adventure', 'Drama', 'Sci-Fi'], year: 2021, rating: 6.9, description: 'On a post-apocalyptic earth, a robot builds himself and must help him take care of his beloved dog, Goodyear.' },
    { title: 'The Tragedy of Macbeth', type: 'Movie', genres: ['Drama', 'Thriller', 'War'], year: 2021, rating: 7.1, description: 'A Scottish lord becomes convinced by a trio of witches that he will become the next King of Scotland.' }
  ],
  'Peacock': [
    { title: 'Poker Face', type: 'TV Show', genres: ['Comedy', 'Crime', 'Drama'], year: 2023, rating: 7.8, description: 'Charlie has an extraordinary ability to determine when someone is lying. She hits the road with her Plymouth Barracuda and encounters a new cast of characters and strange crimes.' },
    { title: 'Bel-Air', type: 'TV Show', genres: ['Drama'], year: 2022, rating: 6.5, description: 'Set in modern-day America, this dramatic reimagining of the beloved sitcom The Fresh Prince of Bel-Air.' },
    { title: 'Twisted Metal', type: 'TV Show', genres: ['Action', 'Comedy'], year: 2023, rating: 7.3, description: 'Follows a motor-mouthed outsider offered a chance at a better life, but only if he can successfully deliver a mysterious package across a post-apocalyptic wasteland.' },
    { title: 'The Resort', type: 'TV Show', genres: ['Comedy', 'Mystery', 'Thriller'], year: 2022, rating: 7.0, description: 'Exploring a 15-year-old mystery, a married couple becomes embroiled in a bizarre web of theories.' },
    { title: 'Rutherford Falls', type: 'TV Show', genres: ['Comedy'], year: 2021, rating: 7.3, description: 'A lifelong friendship is tested when an Indian casino opens in a small town in upstate New York.' },
    { title: 'Girls5eva', type: 'TV Show', genres: ['Comedy', 'Music'], year: 2021, rating: 7.4, description: 'A one-hit-wonder girl group from the \'90s gets a second shot at success.' },
    { title: 'Yellowstone', type: 'TV Show', genres: ['Drama', 'Western'], year: 2018, rating: 8.7, description: 'A ranching family in Montana faces off against others encroaching on their land.' },
    { title: 'Brooklyn Nine-Nine', type: 'TV Show', genres: ['Comedy', 'Crime'], year: 2013, rating: 8.4, description: 'Comedy series following the exploits of detectives in Brooklyn\'s 99th precinct.' },
    { title: 'The Office', type: 'TV Show', genres: ['Comedy'], year: 2005, rating: 9.0, description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.' },
    { title: 'Parks and Recreation', type: 'TV Show', genres: ['Comedy'], year: 2009, rating: 8.6, description: 'The absurd antics of an Indiana town\'s public officials as they pursue sundry projects to make their city a better place.' },
    { title: 'Halloween Ends', type: 'Movie', genres: ['Horror', 'Thriller'], year: 2022, rating: 5.0, description: 'The saga of Michael Myers and Laurie Strode comes to a spine-chilling climax in the final installment of this trilogy.' },
    { title: 'M3GAN', type: 'Movie', genres: ['Horror', 'Sci-Fi', 'Thriller'], year: 2022, rating: 6.3, description: 'A robotics engineer at a toy company builds a life-like doll that begins to take on a life of its own.' },
    { title: 'Nope', type: 'Movie', genres: ['Horror', 'Mystery', 'Sci-Fi'], year: 2022, rating: 6.8, description: 'The residents of a lonely gulch in inland California bear witness to an uncanny and chilling discovery.' },
    { title: 'Bros', type: 'Movie', genres: ['Comedy', 'Romance'], year: 2022, rating: 6.4, description: 'Two men with commitment problems attempt a relationship.' },
    { title: 'Easter Sunday', type: 'Movie', genres: ['Comedy'], year: 2022, rating: 5.3, description: 'A man returns home for an Easter celebration with his riotous, bickering, eating, drinking, laughing, loving family.' }
  ],
  'Paramount+': [
    { title: '1923', type: 'TV Show', genres: ['Drama', 'Western'], year: 2022, rating: 8.7, description: 'The Dutton family faces new challenges in the early 20th century, including pandemics, historic drought, and the Great Depression.' },
    { title: 'Tulsa King', type: 'TV Show', genres: ['Crime', 'Drama'], year: 2022, rating: 8.1, description: 'Following his release from prison, mafia capo Dwight "The General" Manfredi is exiled to Tulsa, Oklahoma.' },
    { title: 'Special Ops: Lioness', type: 'TV Show', genres: ['Action', 'Drama', 'Thriller'], year: 2023, rating: 7.4, description: 'CIA operative Joe attempts to balance her personal and professional lives as the tip of the spear in the agency\'s war on terror.' },
    { title: 'Halo', type: 'TV Show', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2022, rating: 7.0, description: 'With the galaxy on the brink of destruction, Master Chief leads his team of Spartans against the alien threat known as the Covenant.' },
    { title: 'Star Trek: Strange New Worlds', type: 'TV Show', genres: ['Action', 'Adventure', 'Sci-Fi'], year: 2022, rating: 8.3, description: 'A prequel to Star Trek: The Original Series, the show follows Captain Pike and the crew of the Starship Enterprise.' },
    { title: 'Mayor of Kingstown', type: 'TV Show', genres: ['Crime', 'Drama', 'Thriller'], year: 2021, rating: 8.2, description: 'The McLusky family are power brokers in Kingstown, Michigan, where the business of incarceration is the only thriving industry.' },
    { title: 'Frasier', type: 'TV Show', genres: ['Comedy'], year: 2023, rating: 6.8, description: 'Frasier is off to a different city with new challenges to face, new relationships to forge, and an old dream or two to finally fulfill.' },
    { title: 'Lawmen: Bass Reeves', type: 'TV Show', genres: ['Drama', 'Western'], year: 2023, rating: 7.8, description: 'The story of legendary lawman Bass Reeves, one of the greatest frontier heroes in American history.' },
    { title: 'Evil', type: 'TV Show', genres: ['Crime', 'Drama', 'Horror'], year: 2019, rating: 7.7, description: 'A skeptical psychologist joins a priest-in-training and a carpenter as they investigate the church\'s backlog of unexplained mysteries.' },
    { title: 'The Good Fight', type: 'TV Show', genres: ['Crime', 'Drama'], year: 2017, rating: 8.3, description: 'When Diane Lockhart\'s life savings are lost, she must start from scratch at a new firm.' },
    { title: 'A Quiet Place Part II', type: 'Movie', genres: ['Drama', 'Horror', 'Sci-Fi'], year: 2020, rating: 7.3, description: 'Following the events at home, the Abbott family now face the terrors of the outside world as they fight for survival in silence.' },
    { title: 'Mission: Impossible - Dead Reckoning Part One', type: 'Movie', genres: ['Action', 'Adventure', 'Thriller'], year: 2023, rating: 7.7, description: 'Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity.' },
    { title: 'Top Gun: Maverick', type: 'Movie', genres: ['Action', 'Drama'], year: 2022, rating: 8.3, description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past.' },
    { title: 'Dungeons & Dragons: Honor Among Thieves', type: 'Movie', genres: ['Action', 'Adventure', 'Comedy'], year: 2023, rating: 7.2, description: 'A charming thief and a band of unlikely adventurers embark on an epic quest to retrieve a lost relic.' },
    { title: 'Teenage Mutant Ninja Turtles: Mutant Mayhem', type: 'Movie', genres: ['Animation', 'Action', 'Adventure'], year: 2023, rating: 7.2, description: 'The turtle brothers work to earn the love of New York City while facing down an army of mutants.' }
  ]
};

class MockContentService {
  // Fetch content for a platform
  async fetchContentForPlatform(platformName, limit = 25) {
    console.log(`\n📺 Fetching ${limit} titles for ${platformName}...`);
    
    const platformContent = MOCK_CONTENT_DATABASE[platformName] || [];
    
    // Simulate API delay
    await this.delay(300);
    
    const content = platformContent.slice(0, limit).map(item => ({
      ...item,
      platform: platformName,
      externalSource: 'mock_justwatch',
      posterUrl: this.generatePosterUrl(item.title),
      backdropUrl: this.generateBackdropUrl(item.title),
      imdbId: this.generateImdbId()
    }));
    
    console.log(`✓ Fetched ${content.length} titles for ${platformName}`);
    return content;
  }

  // Save content to database
  async saveContentToDatabase(platformName, contentArray) {
    let saved = 0;
    let skipped = 0;

    for (const content of contentArray) {
      try {
        await NetworkContent.findOneAndUpdate(
          { 
            title: content.title, 
            platform: platformName 
          },
          {
            ...content,
            lastUpdated: new Date()
          },
          { 
            upsert: true, 
            new: true 
          }
        );
        saved++;
      } catch (error) {
        console.error(`Error saving ${content.title}:`, error.message);
        skipped++;
      }
    }

    console.log(`💾 Saved: ${saved}, Skipped: ${skipped}`);
    return { saved, skipped };
  }

  // Fetch and save all platforms
  async fetchAndSaveAllPlatforms(limit = 25) {
    console.log('🚀 Starting content fetch for all platforms...\n');
    
    const results = {
      total: 0,
      byPlatform: {}
    };

    for (const platformName of Object.keys(MOCK_CONTENT_DATABASE)) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing: ${platformName}`);
        console.log('='.repeat(60));
        
        const content = await this.fetchContentForPlatform(platformName, limit);
        const saveResult = await this.saveContentToDatabase(platformName, content);
        
        results.byPlatform[platformName] = {
          fetched: content.length,
          saved: saveResult.saved,
          skipped: saveResult.skipped
        };
        results.total += saveResult.saved;
        
        // Rate limiting between platforms
        await this.delay(500);
      } catch (error) {
        console.error(`❌ Error processing ${platformName}:`, error.message);
        results.byPlatform[platformName] = {
          error: error.message
        };
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All platforms processed!');
    console.log('='.repeat(60));
    console.log(`\nTotal content saved: ${results.total}`);
    console.log('\nBreakdown by platform:');
    Object.entries(results.byPlatform).forEach(([platform, stats]) => {
      if (stats.error) {
        console.log(`  ${platform}: ERROR - ${stats.error}`);
      } else {
        console.log(`  ${platform}: ${stats.saved} saved (${stats.skipped} skipped)`);
      }
    });

    return results;
  }

  // Helper: generate poster URL
  generatePosterUrl(title) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `https://via.placeholder.com/300x450/1e40af/ffffff?text=${encodeURIComponent(title.substring(0, 20))}`;
  }

  // Helper: generate backdrop URL
  generateBackdropUrl(title) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `https://via.placeholder.com/1920x1080/1e40af/ffffff?text=${encodeURIComponent(title.substring(0, 20))}`;
  }

  // Helper: generate random IMDB ID
  generateImdbId() {
    return `tt${Math.floor(Math.random() * 10000000)}`;
  }

  // Helper: delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new MockContentService();

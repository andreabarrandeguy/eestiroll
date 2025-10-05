import { Colors } from '@/constants/Colors';

export const categories = ['VERB', 'NOUN', 'ADJECTIVE', 'PLACE', 'ADVERB', 'TIME', 'CONNECTOR', 'PREPOSITION', 'QUESTION', 'PRONOUN'];

export const allWords = {
    'VERB': ['rääkima', 'kuulama', 'lugema', 'kirjutama', 'sööma', 'jooma', 'mängima', 'joonistama', 'õppima', 'tahtma', 'oskama', 'käima', 'minema', 'tulema', 'vaatama', 'magama', 'armastama', 'soovima', 'maksma', 'ostma', 'algama', 'lõppema', 'märkima', 'küsima', 'vastama', 'olema', 'ootama', 'lähema', 'maitsema', 'tegema', 'tantsima', 'korjama', 'pesema', 'ujuma', 'suusatama', 'uisutama', 'filmima', 'istuma', 'jälgima', 'koristama', 'elama', 'saama', 'ütlema'],
    'NOUN': ['raamat', 'laps', 'kass', 'kool', 'kodu', 'raha', 'värv', 'sült', 'liha', 'hakkliha', 'kana', 'õlu', 'vein', 'kohuke', 'päike', 'ilm', 'pood', 'õhtu', 'öö', 'sõber', 'kursus', 'keel', 'aadress', 'number', 'nimi', 'ruum', 'kohvipaus', 'mäng', 'aeg', 'tervis', 'ananass', 'apelsin', 'tomat', 'banaan', 'buss', 'auto', 'pass', 'takso', 'tramm', 'jogurt', 'restoran', 'kasiino', 'pubi', 'pitsa', 'baar', 'viisa', 'kino', 'teater', 'kontsert', 'ballett', 'kohv', 'tee', 'elekter', 'kakao', 'limonaad', 'telefon', 'televisor', 'mikser', 'raadio', 'motor', 'kliima', 'kivi', 'melon', 'aprikoos', 'sidrun', 'vitamiin', 'professor', 'psühholoog', 'sekretär', 'vampiir', 'arhitekt', 'pank', 'apteek', 'bensiin', 'hotell', 'sool', 'kilo', 'suhkur', 'pipar', 'ketsup', 'orhidee', 'tulp', 'roos', 'vaas', 'kaktus', 'elevant', 'sebra', 'tiiger', 'kaamel', 'dinosaurus', 'majonees', 'margariin', 'menüü', 'martsipan', 'šokolaad', 'matemaatika', 'füüsika', 'bioloogia', 'keemia', 'sampus', 'viski', 'pohmel', 'viin', 'juust', 'küpsis', 'jäätis', 'seen', 'mesi', 'vesi', 'liiter', 'või', 'kartul', 'piim', 'sibul', 'tatar', 'rosinad', 'leivasupp', 'porgand', 'maasikas', 'õun', 'riis', 'mahl', 'puder', 'salat', 'supp', 'võileib', 'külmkapp', 'küülik', 'õpetaja', 'jook', 'aedvili', 'puuvili', 'kala', 'muna', 'leib', 'sai', 'komm', 'vorst', 'kook', 'sink', 'müüja', 'klient', 'eurot', 'sent', 'omlett', 'lemmik', 'lusik', 'kahvel', 'nuga', 'vannis', 'kalamarja', 'filmi'],
    'ADJECTIVE': ['valge', 'must', 'punane', 'sinine', 'kollane', 'suur', 'väike', 'hea', 'halb', 'väsinud', 'rahulik', 'soe', 'külm', 'tore', 'armas', 'huvitav', 'tavaline', 'selge', 'odav', 'kallis', 'eesti', 'vene', 'saksa', 'prantsuse', 'inglise', 'iiri', 'ukraina', 'portugali', 'hispaania', 'armeenia', 'roheline', 'pruun', 'lilla', 'hall', 'roosa', 'oranž', 'beež', 'normaalne', 'positiivne', 'negatiivne', 'pessimistlik', 'optimistlik', 'magus', 'valmis', 'jahe', 'palav'],
    'PLACE': ['kool', 'pood', 'kodu', 'Mustamäe', 'Tartu', 'Tallinn', 'Pärnu', 'Narva', 'Soome', 'Venemaa', 'Saaremaa', 'Pariis', 'Berliin', 'London', 'Helsingi', 'kohvik', 'rand', 'park', 'turg', 'raamatukogu', 'maa', 'Saksamaa', 'Inglismaa', 'Iirimaa', 'Ukraina', 'Pakistan', 'Brasiilia', 'Nigeeria', 'Armeenia', 'Argentina', 'Kohtla-Järvel', 'Sillamäe'],
    'ADVERB': ['tavaliselt', 'praegu', 'alati', 'kunagi', 'siin', 'seal', 'eile', 'täna', 'homme', 'varsti', 'hästi', 'halvasti', 'kiiresti', 'aeglaselt', 'koos', 'üksi', 'peaaegu', 'juba', 'veel', 'ainult', 'siis', 'jälle', 'just', 'normaalselt', 'ilma', 'kui'],
    'TIME': ['hommik', 'päev', 'õhtu', 'öö', 'eile', 'täna', 'homme', 'kevad', 'suvi', 'sügis', 'talv', 'nädalavahetus', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev', 'pühapäev', 'nüüd', 'kuu', 'nädal', 'veebruar', 'mai', 'september', 'oktoober', 'jaanuar', 'juuli', 'märts', 'detsember', 'aprill', 'november', 'august', 'sünnipäev'],
    'CONNECTOR': ['ja', 'aga', 'sest', 'või', 'kui', 'kuigi', 'et', 'nii', 'siis', 'ehk', 'vaid', 'nagu', 'samuti', 'samuti kui', 'kuna', 'enne kui', 'pärast kui', 'kuni', 'samas'],
    'PREPOSITION': ['peal', 'all', 'sees', 'kõrval', 'ees', 'taga', 'vahel', 'juures', 'kaudu', 'pärast', 'enne', 'ümber', 'lähedal', 'peale', 'alla', 'vastu', 'seest', 'mööda', 'juurde', 'kohal', 'kaardiga', 'sulas'],
    'QUESTION': ['mis', 'mida', 'mille', 'milline', 'miks', 'kus', 'kust', 'kuhu', 'kelle', 'kellel', 'kellele', 'keda', 'millal', 'kui palju', 'kuidas', 'mitu', 'kas', 'kellega', 'kuipalju', 'kumb', 'missugune'],
    'PRONOUN': ['mina', 'sina', 'tema', 'meie', 'teie', 'nemad', 'ma', 'sa', 'ta', 'nad', 'mu', 'su', 'oma', 'mind', 'sind', 'teda', 'meid', 'teid', 'neid', 'minu']
};

export const categoryColorMap: { [key: string]: string } = {
    'VERB': Colors.yellow,
    'NOUN': Colors.lightgreen,
    'ADJECTIVE': Colors.lightpurple,
    'PLACE': Colors.blue,
    'ADVERB': Colors.red,
    'TIME': Colors.lightpink,
    'CONNECTOR': Colors.green,
    'PREPOSITION': Colors.purple,
    'QUESTION': Colors.pink,
    'PRONOUN': Colors.lightblue
};
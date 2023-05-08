// source: https://github.com/LifeSG/react-design-system/blob/master/src/phone-number-input/data/country-code.ts
// =============================================================================
// Country model:
// [
//    Country name,
//    Regions,
//    iso2 code,
//    International dial code,
//    Format (if available),
// ]
// =============================================================================
// Regions:
// ['america', 'europe', 'asia', 'oceania', 'africa']
// =============================================================================
// Sub-regions:
// ['north-america', 'south-america', 'central-america', 'carribean',
//  'eu-union', 'ex-ussr', 'ex-yugos', 'baltic', 'middle-east', 'north-africa']
// =============================================================================

export const CountryData = [
	["Afghanistan", ["asia"], "af", "93"],
	["Albania", ["europe"], "al", "355"],
	["Algeria", ["africa", "north-africa"], "dz", "213"],
	["Andorra", ["europe"], "ad", "376"],
	["Angola", ["africa"], "ao", "244"],
	["Antigua and Barbuda", ["america", "carribean"], "ag", "1268"],
	["Argentina", ["america", "south-america"], "ar", "54", "(..) ........"],
	["Armenia", ["asia", "ex-ussr"], "am", "374", ".. ......"],
	["Aruba", ["america", "carribean"], "aw", "297"],
	["Australia", ["oceania"], "au", "61", "(..) .... ...."],
	["Austria", ["europe", "eu-union"], "at", "43"],
	["Azerbaijan", ["asia", "ex-ussr"], "az", "994", "(..) ... .. .."],
	["Bahamas", ["america", "carribean"], "bs", "1242"],
	["Bahrain", ["middle-east"], "bh", "973"],
	["Bangladesh", ["asia"], "bd", "880"],
	["Barbados", ["america", "carribean"], "bb", "1246"],
	["Belarus", ["europe", "ex-ussr"], "by", "375", "(..) ... .. .."],
	["Belgium", ["europe", "eu-union"], "be", "32", "... .. .. .."],
	["Belize", ["america", "central-america"], "bz", "501"],
	["Benin", ["africa"], "bj", "229"],
	["Bhutan", ["asia"], "bt", "975"],
	["Bolivia", ["america", "south-america"], "bo", "591"],
	["Bosnia and Herzegovina", ["europe", "ex-yugos"], "ba", "387"],
	["Botswana", ["africa"], "bw", "267"],
	["Brazil", ["america", "south-america"], "br", "55", "(..) ........."],
	["British Indian Ocean Territory", ["asia"], "io", "246"],
	["Brunei", ["asia"], "bn", "673"],
	["Bulgaria", ["europe", "eu-union"], "bg", "359"],
	["Burkina Faso", ["africa"], "bf", "226"],
	["Burundi", ["africa"], "bi", "257"],
	["Cambodia", ["asia"], "kh", "855"],
	["Cameroon", ["africa"], "cm", "237"],
	["Canada", ["america", "north-america"], "ca", "1", "(...) ... ...."],
	["Cape Verde", ["africa"], "cv", "238"],
	["Caribbean Netherlands", ["america", "carribean"], "bq", "599", ""],
	["Central African Republic", ["africa"], "cf", "236"],
	["Chad", ["africa"], "td", "235"],
	["Chile", ["america", "south-america"], "cl", "56"],
	["China", ["asia"], "cn", "86", ".. ........."],
	["Colombia", ["america", "south-america"], "co", "57", "... ... ...."],
	["Comoros", ["africa"], "km", "269"],
	["Congo", ["africa"], "cd", "243"],
	["Congo", ["africa"], "cg", "242"],
	["Costa Rica", ["america", "central-america"], "cr", "506", ".... ...."],
	["Côte d’Ivoire", ["africa"], "ci", "225", ".. .. .. .."],
	["Croatia", ["europe", "eu-union", "ex-yugos"], "hr", "385"],
	["Cuba", ["america", "carribean"], "cu", "53"],
	["Curaçao", ["america", "carribean"], "cw", "599", ""],
	["Cyprus", ["europe", "eu-union"], "cy", "357", ".. ......"],
	["Czech Republic", ["europe", "eu-union"], "cz", "420", "... ... ..."],
	["Denmark", ["europe", "eu-union", "baltic"], "dk", "45", ".. .. .. .."],
	["Djibouti", ["africa"], "dj", "253"],
	["Dominica", ["america", "carribean"], "dm", "1767"],
	["Dominican Republic", ["america", "carribean"], "do", "1", ""],
	["Ecuador", ["america", "south-america"], "ec", "593"],
	["Egypt", ["africa", "north-africa"], "eg", "20"],
	["El Salvador", ["america", "central-america"], "sv", "503", ".... ...."],
	["Equatorial Guinea", ["africa"], "gq", "240"],
	["Eritrea", ["africa"], "er", "291"],
	["Estonia", ["europe", "eu-union", "ex-ussr", "baltic"], "ee", "372", ".... ......"],
	["Ethiopia", ["africa"], "et", "251"],
	["Fiji", ["oceania"], "fj", "679"],
	["Finland", ["europe", "eu-union", "baltic"], "fi", "358", ".. ... .. .."],
	["France", ["europe", "eu-union"], "fr", "33", ". .. .. .. .."],
	["French Guiana", ["america", "south-america"], "gf", "594"],
	["French Polynesia", ["oceania"], "pf", "689"],
	["Gabon", ["africa"], "ga", "241"],
	["Gambia", ["africa"], "gm", "220"],
	["Georgia", ["asia", "ex-ussr"], "ge", "995"],
	["Germany", ["europe", "eu-union", "baltic"], "de", "49", ".... ........"],
	["Ghana", ["africa"], "gh", "233"],
	["Greece", ["europe", "eu-union"], "gr", "30"],
	["Grenada", ["america", "carribean"], "gd", "1473"],
	["Guadeloupe", ["america", "carribean"], "gp", "590", "", 0],
	["Guam", ["oceania"], "gu", "1671"],
	["Guatemala", ["america", "central-america"], "gt", "502", ".... ...."],
	["Guinea", ["africa"], "gn", "224"],
	["Guinea-Bissau", ["africa"], "gw", "245"],
	["Guyana", ["america", "south-america"], "gy", "592"],
	["Haiti", ["america", "carribean"], "ht", "509", ".... ...."],
	["Honduras", ["america", "central-america"], "hn", "504"],
	["Hong Kong", ["asia"], "hk", "852", ".... ...."],
	["Hungary", ["europe", "eu-union"], "hu", "36"],
	["Iceland", ["europe"], "is", "354", "... ...."],
	["India", ["asia"], "in", "91", "..... ....."],
	["Indonesia", ["asia"], "id", "62"],
	["Iran", ["middle-east"], "ir", "98", "... ... ...."],
	["Iraq", ["middle-east"], "iq", "964"],
	["Ireland", ["europe", "eu-union"], "ie", "353", ".. ......."],
	["Israel", ["middle-east"], "il", "972", "... ... ...."],
	["Italy", ["europe", "eu-union"], "it", "39", "... ......."],
	["Jamaica", ["america", "carribean"], "jm", "1876"],
	["Japan", ["asia"], "jp", "81", ".. .... ...."],
	["Jordan", ["middle-east"], "jo", "962"],
	["Kazakhstan", ["asia", "ex-ussr"], "kz", "7", "... ... .. .."],
	["Kenya", ["africa"], "ke", "254"],
	["Kiribati", ["oceania"], "ki", "686"],
	["Kosovo", ["europe", "ex-yugos"], "xk", "383"],
	["Kuwait", ["middle-east"], "kw", "965"],
	["Kyrgyzstan", ["asia", "ex-ussr"], "kg", "996", "... ... ..."],
	["Laos", ["asia"], "la", "856"],
	["Latvia", ["europe", "eu-union", "ex-ussr", "baltic"], "lv", "371", ".. ... ..."],
	["Lebanon", ["middle-east"], "lb", "961"],
	["Lesotho", ["africa"], "ls", "266"],
	["Liberia", ["africa"], "lr", "231"],
	["Libya", ["africa", "north-africa"], "ly", "218"],
	["Liechtenstein", ["europe"], "li", "423"],
	["Lithuania", ["europe", "eu-union", "ex-ussr", "baltic"], "lt", "370"],
	["Luxembourg", ["europe", "eu-union"], "lu", "352"],
	["Macau", ["asia"], "mo", "853"],
	["Macedonia", ["europe", "ex-yugos"], "mk", "389"],
	["Madagascar", ["africa"], "mg", "261"],
	["Malawi", ["africa"], "mw", "265"],
	["Malaysia", ["asia"], "my", "60", ".. .... ...."],
	["Maldives", ["asia"], "mv", "960"],
	["Mali", ["africa"], "ml", "223"],
	["Malta", ["europe", "eu-union"], "mt", "356"],
	["Marshall Islands", ["oceania"], "mh", "692"],
	["Martinique", ["america", "carribean"], "mq", "596"],
	["Mauritania", ["africa"], "mr", "222"],
	["Mauritius", ["africa"], "mu", "230"],
	["Mexico", ["america", "central-america"], "mx", "52", "... ... ...."],
	["Micronesia", ["oceania"], "fm", "691"],
	["Moldova", ["europe"], "md", "373", "(..) .. .. .."],
	["Monaco", ["europe"], "mc", "377"],
	["Mongolia", ["asia"], "mn", "976"],
	["Montenegro", ["europe", "ex-yugos"], "me", "382"],
	["Morocco", ["africa", "north-africa"], "ma", "212"],
	["Mozambique", ["africa"], "mz", "258"],
	["Myanmar", ["asia"], "mm", "95"],
	["Namibia", ["africa"], "na", "264"],
	["Nauru", ["africa"], "nr", "674"],
	["Nepal", ["asia"], "np", "977"],
	["Netherlands", ["europe", "eu-union"], "nl", "31", ".. ........"],
	["New Caledonia", ["oceania"], "nc", "687"],
	["New Zealand", ["oceania"], "nz", "64", "... ... ...."],
	["Nicaragua", ["america", "central-america"], "ni", "505"],
	["Niger", ["africa"], "ne", "227"],
	["Nigeria", ["africa"], "ng", "234"],
	["North Korea", ["asia"], "kp", "850"],
	["Norway", ["europe", "baltic"], "no", "47", "... .. ..."],
	["Oman", ["middle-east"], "om", "968"],
	["Pakistan", ["asia"], "pk", "92", "... ......."],
	["Palau", ["oceania"], "pw", "680"],
	["Palestine", ["middle-east"], "ps", "970"],
	["Panama", ["america", "central-america"], "pa", "507"],
	["Papua New Guinea", ["oceania"], "pg", "675"],
	["Paraguay", ["america", "south-america"], "py", "595"],
	["Peru", ["america", "south-america"], "pe", "51"],
	["Philippines", ["asia"], "ph", "63", ".... ......."],
	["Poland", ["europe", "eu-union", "baltic"], "pl", "48", "... ... ..."],
	["Portugal", ["europe", "eu-union"], "pt", "351"],
	["Puerto Rico", ["america", "carribean"], "pr", "1", ""],
	["Qatar", ["middle-east"], "qa", "974"],
	["Réunion", ["africa"], "re", "262"],
	["Romania", ["europe", "eu-union"], "ro", "40"],
	["Russia", ["europe", "asia", "ex-ussr", "baltic"], "ru", "7", "(...) ... .. .."],
	["Rwanda", ["africa"], "rw", "250"],
	["Saint Kitts and Nevis", ["america", "carribean"], "kn", "1869"],
	["Saint Lucia", ["america", "carribean"], "lc", "1758"],
	["Saint Vincent and the Grenadines", ["america", "carribean"], "vc", "1784"],
	["Samoa", ["oceania"], "ws", "685"],
	["San Marino", ["europe"], "sm", "378"],
	["São Tomé and Príncipe", ["africa"], "st", "239"],
	["Saudi Arabia", ["middle-east"], "sa", "966"],
	["Senegal", ["africa"], "sn", "221"],
	["Serbia", ["europe", "ex-yugos"], "rs", "381"],
	["Seychelles", ["africa"], "sc", "248"],
	["Sierra Leone", ["africa"], "sl", "232"],
	["Singapore", ["asia"], "sg", "65", ".... ...."],
	["Slovakia", ["europe", "eu-union"], "sk", "421"],
	["Slovenia", ["europe", "eu-union", "ex-yugos"], "si", "386"],
	["Solomon Islands", ["oceania"], "sb", "677"],
	["Somalia", ["africa"], "so", "252"],
	["South Africa", ["africa"], "za", "27"],
	["South Korea", ["asia"], "kr", "82", "... .... ...."],
	["South Sudan", ["africa", "north-africa"], "ss", "211"],
	["Spain", ["europe", "eu-union"], "es", "34", "... ... ..."],
	["Sri Lanka", ["asia"], "lk", "94"],
	["Sudan", ["africa"], "sd", "249"],
	["Suriname", ["america", "south-america"], "sr", "597"],
	["Swaziland", ["africa"], "sz", "268"],
	["Sweden", ["europe", "eu-union", "baltic"], "se", "46", "(...) ... ..."],
	["Switzerland", ["europe"], "ch", "41", ".. ... .. .."],
	["Syria", ["middle-east"], "sy", "963"],
	["Taiwan", ["asia"], "tw", "886"],
	["Tajikistan", ["asia", "ex-ussr"], "tj", "992"],
	["Tanzania", ["africa"], "tz", "255"],
	["Thailand", ["asia"], "th", "66"],
	["Timor-Leste", ["asia"], "tl", "670"],
	["Togo", ["africa"], "tg", "228"],
	["Tonga", ["oceania"], "to", "676"],
	["Trinidad and Tobago", ["america", "carribean"], "tt", "1868"],
	["Tunisia", ["africa", "north-africa"], "tn", "216"],
	["Turkey", ["europe"], "tr", "90", "... ... .. .."],
	["Turkmenistan", ["asia", "ex-ussr"], "tm", "993"],
	["Tuvalu", ["asia"], "tv", "688"],
	["Uganda", ["africa"], "ug", "256"],
	["Ukraine", ["europe", "ex-ussr"], "ua", "380", "(..) ... .. .."],
	["United Arab Emirates", ["middle-east"], "ae", "971"],
	["United Kingdom", ["europe", "eu-union"], "gb", "44", ".... ......"],
	["United States", ["america", "north-america"], "us", "1", "(...) ... ...."],
	["Uruguay", ["america", "south-america"], "uy", "598"],
	["Uzbekistan", ["asia", "ex-ussr"], "uz", "998", ".. ... .. .."],
	["Vanuatu", ["oceania"], "vu", "678"],
	["Vatican City", ["europe"], "va", "39", ".. .... ...."],
	["Venezuela", ["america", "south-america"], "ve", "58"],
	["Vietnam", ["asia"], "vn", "84"],
	["Yemen", ["middle-east"], "ye", "967"],
	["Zambia", ["africa"], "zm", "260"],
	["Zimbabwe", ["africa"], "zw", "263"],
] as const;

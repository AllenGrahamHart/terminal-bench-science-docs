export type Contributor = {
  name: string;
  affiliation?: string;
  /** GitHub username when the README links to github.com */
  github?: string;
  /** Non-GitHub profile URL */
  href?: string;
};

export type ContributorGroup = {
  title: string;
  contributors: Contributor[];
};

export const CONTRIBUTOR_GROUPS: ContributorGroup[] = [
  {
    title: 'Project Leadership',
    contributors: [
      {
        name: 'Steven Dillmann',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?hl=en&user=mwC8O9sAAAAJ',
      },
      {
        name: 'Sanmi Koyejo',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=EaaOeJwAAAAJ',
      },
      {
        name: 'Ludwig Schmidt',
        affiliation: 'Stanford University · Anthropic',
        href: 'https://scholar.google.com/citations?user=SWMKy70AAAAJ',
      },
    ],
  },
  {
    title: 'Senior Reviewers',
    contributors: [
      {
        name: 'Allen Hart',
        affiliation: 'University of Warwick',
        href: 'https://scholar.google.com/citations?user=XrwHdqMAAAAJ',
      },
      {
        name: 'Ivan Bercovich',
        affiliation: 'UC Santa Barbara',
        href: 'https://scholar.google.com/citations?user=UYoHaPoAAAAJ',
      },
      {
        name: 'Joseph Janssen',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=u10zEQYAAAAJ',
      },
      {
        name: 'Jiaming Hu',
        affiliation: 'Boston University',
        href: 'https://scholar.google.com/citations?user=2Nql6mUAAAAJ',
      },
      {
        name: 'Steffen Bollmann',
        affiliation: 'University of Queensland',
        href: 'https://scholar.google.com/citations?user=HmXlj24AAAAJ',
      },
      {
        name: 'Sergey Aganezov',
        affiliation: 'Oxford Nanopore Technologies',
        href: 'https://scholar.google.com/citations?user=CyV1zOwAAAAJ',
      },
    ],
  },
  {
    title: 'Reviewers',
    contributors: [
      {
        name: 'Ben Blaiszik',
        affiliation: 'University of Chicago · Argonne National Laboratory',
        href: 'https://scholar.google.com/citations?user=J-x5n7IAAAAJ',
      },
      {
        name: 'Aaron Feller',
        affiliation: 'University of Texas at Austin',
        href: 'https://scholar.google.com/citations?user=Ez8l_VoAAAAJ',
      },
      {
        name: 'Robert Joseph George',
        affiliation: 'Caltech',
        href: 'https://scholar.google.com/citations?user=5P1Uwy4AAAAJ',
      },
      {
        name: 'Qiuyu Gong',
        affiliation: 'Allen Institute',
        href: 'https://scholar.google.com/citations?user=MZcRMNcAAAAJ',
      },
      {
        name: 'Han Hou',
        affiliation: 'Allen Institute',
        href: 'https://scholar.google.com/citations?user=Dmf8294AAAAJ',
      },
      {
        name: 'Karl Krauth',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=qq4zSmQAAAAJ',
      },
      {
        name: 'Yiqi Liu',
        affiliation: 'Princeton University',
        href: 'https://scholar.google.com/citations?user=w5T-N04AAAAJ',
      },
      {
        name: 'Robert Zhang',
        affiliation: 'University of Texas at Austin',
        href: 'https://scholar.google.com/citations?user=ewz2zM8AAAAJ',
      },
    ],
  },
  {
    title: 'Task Contributors',
    contributors: [
      {
        name: 'Allen Hart',
        affiliation: 'University of Warwick',
        href: 'https://scholar.google.com/citations?user=XrwHdqMAAAAJ',
      },
      {
        name: 'Bo Chen',
        affiliation: 'The University of Hong Kong',
        href: 'https://scholar.google.com/citations?user=BWfZIIYAAAAJ',
      },
      {
        name: 'Denali Archer',
        affiliation: 'University of Cambridge',
        github: 'denali_52758',
      },
      {
        name: 'Joseph Janssen',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=u10zEQYAAAAJ',
      },
      {
        name: 'Luyang Kong',
        affiliation: 'Amazon',
        href: 'https://scholar.google.com/citations?user=tFbgzq0AAAAJ',
      },
      {
        name: 'Robert Sneiderman',
        affiliation: 'McGill University',
        href: 'https://robbysneiderman.com',
      },
      {
        name: 'Yucheng Yuan',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=2rrJap0AAAAJ',
      },
      {
        name: 'Cunxin Huang',
        affiliation: 'The Hong Kong Polytechnic University',
        github: 'OptHuang',
      },
      {
        name: 'Ben Blaiszik',
        affiliation: 'University of Chicago · Argonne National Laboratory',
        href: 'https://scholar.google.com/citations?user=J-x5n7IAAAAJ',
      },
      {
        name: 'Haomiao Fang',
        affiliation: 'Imperial College London',
        href: 'https://orcid.org/0009-0008-9698-541X',
      },
      {
        name: 'Zengji Tu',
        affiliation: 'Peking University',
        href: 'https://scholar.google.com/citations?user=1skhG50AAAAJ',
      },
      {
        name: 'Yicheng Rui',
        affiliation: 'Shanghai Jiao Tong University',
        href: 'https://scholar.google.com/citations?user=G03qbq0AAAAJ',
      },
      {
        name: 'Aaron Feller',
        affiliation: 'University of Texas at Austin',
        github: 'AaronFeller',
      },
      {
        name: 'Anirudha Ramesh',
        affiliation: 'Independent Researcher',
        href: 'https://scholar.google.com/citations?user=_xTXoTQAAAAJ',
      },
      {
        name: 'Anton Thieme',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=nTA45uoAAAAJ',
      },
      {
        name: 'Baojian Zhou',
        affiliation: 'Fudan University',
        href: 'https://scholar.google.com/citations?user=FtDxt4YAAAAJ',
      },
      {
        name: 'Chenyu Wang',
        affiliation: 'Harvard University',
        href: 'https://scholar.google.com/citations?user=QI96hfoAAAAJ',
      },
      {
        name: 'Christos Ziakas',
        affiliation: 'Imperial College London',
        href: 'https://chziakas.github.io',
      },
      {
        name: 'Federico Califano',
        affiliation: 'Sapienza University of Rome',
        href: 'https://scholar.google.com/citations?user=RAQOFb0AAAAJ',
      },
      {
        name: 'Frederik Kelbel',
        affiliation: 'Imperial College London',
        href: 'https://scholar.google.com/citations?user=wc6IPo0AAAAJ',
      },
      {
        name: 'Ganesh Sankar',
        affiliation: 'University of California, Berkeley',
        github: 'gsankar967',
      },
      {
        name: 'Han Hou',
        affiliation: 'Allen Institute',
        href: 'https://scholar.google.com/citations?user=Dmf8294AAAAJ',
      },
      {
        name: 'Hanchen Wang',
        affiliation: 'Stanford University',
        href: 'https://hanchenw.com',
      },
      {
        name: 'Haoxuan Zeng',
        affiliation: 'University of Michigan',
        href: 'https://scholar.google.com/citations?user=z14M_5kAAAAJ',
      },
      {
        name: 'James Kermode',
        affiliation: 'University of Warwick',
        href: 'https://warwick.ac.uk/jrkermode',
      },
      {
        name: 'Jenil Gajera',
        affiliation: 'Independent Researcher',
        github: 'gajerajenil',
      },
      {
        name: 'Jiaming Hu',
        affiliation: 'Boston University',
        href: 'https://scholar.google.com/citations?user=2Nql6mUAAAAJ',
      },
      {
        name: 'Jianing Yin',
        affiliation: 'University of Pennsylvania',
        href: 'https://scholar.google.com/citations?user=YkBfKacAAAAJ',
      },
      {
        name: 'Joshua H. Rines',
        affiliation: 'Stanford University',
        href: 'https://www.linkedin.com/in/joshua-h-rines/',
      },
      {
        name: 'Kai Horstmann',
        affiliation: 'Cornell University',
        href: 'https://scholar.google.com/citations?user=HkgDkoIAAAAJ',
      },
      {
        name: 'Maan Pandya',
        affiliation: 'Stanford University',
        href: 'https://www.linkedin.com/in/maanpandya/',
      },
      {
        name: 'Marcelo Alvarez',
        affiliation: 'Stanford University · SLAC',
        github: 'marcelo-alvarez',
      },
      {
        name: 'Mars Gao',
        affiliation: 'University of Washington',
        href: 'https://scholar.google.com/citations?user=JnmjCO4AAAAJ',
      },
      {
        name: 'Martiño Ríos García',
        affiliation: 'Friedrich Schiller University Jena',
        href: 'https://scholar.google.com/citations?user=QRkKJ20AAAAJ',
      },
      {
        name: 'Pranit Chawla',
        affiliation: 'Independent Researcher',
        href: 'https://scholar.google.com/citations?user=v8hTveEAAAAJ',
      },
      {
        name: 'Qiuyu Gong',
        affiliation: 'Allen Institute',
        href: 'https://scholar.google.com/citations?user=MZcRMNcAAAAJ',
      },
      {
        name: 'Reinhard Heckel',
        affiliation: 'Technical University of Munich',
        href: 'https://scholar.google.com/citations?user=ZWV0I7cAAAAJ',
      },
      {
        name: 'Ricardo Arcifa',
        affiliation: 'Montana Research Foundation',
        href: 'https://scholar.google.com/citations?user=gs-_h18AAAAJ',
      },
      {
        name: 'Robert Joseph George',
        affiliation: 'Caltech',
        href: 'https://scholar.google.com/citations?user=5P1Uwy4AAAAJ',
      },
      {
        name: 'Ruheng Wang',
        affiliation: 'UT Southwestern Medical Center',
        github: 'Ruheng-W',
      },
      {
        name: 'Sergey Aganezov',
        affiliation: 'Oxford Nanopore Technologies, Inc.',
        href: 'https://www.linkedin.com/in/sergey-aganezov',
      },
      {
        name: 'Shengrui Lyu',
        affiliation: 'Anthropic',
        href: 'https://www.linkedin.com/in/shengrui-lyu',
      },
      {
        name: 'Shi Bo',
        affiliation: 'Boston University',
        github: 'shibo769',
      },
      {
        name: 'Steffen Bollmann',
        affiliation: 'University of Queensland',
        href: 'https://mri.sbollmann.net/',
      },
      {
        name: 'Wencan Li',
        affiliation: 'Peking University',
        href: 'https://www.researchgate.net/profile/Wencan-Li',
      },
      {
        name: 'Xiaojun Wu',
        affiliation: 'The Hong Kong University of Science and Technology',
        href: 'https://scholar.google.com/citations?user=nWK11zgAAAAJ',
      },
      {
        name: 'Xin Luo',
        affiliation: 'University of Michigan',
        href: 'https://scholar.google.com/citations?user=qE4sOfEAAAAJ',
      },
      {
        name: 'Yiqi Liu',
        affiliation: 'Princeton University',
        href: 'https://scholar.google.com/citations?user=w5T-N04AAAAJ',
      },
      {
        name: 'Yizhao Chen',
        affiliation: 'University of California, San Diego',
        github: 'Yizhao111',
      },
      {
        name: 'Yuanze Lin',
        affiliation: 'University of Oxford',
        href: 'https://yuanze-lin.me/',
      },
      {
        name: 'Yuxiang Wei',
        affiliation: 'Georgia Institute of Technology',
        href: 'https://yuxiangwei0808.github.io/',
      },
      {
        name: 'Yuxing Lu',
        affiliation: 'Georgia Institute of Technology',
        href: 'https://yuxinglu613.github.io/',
      },
      {
        name: 'Zhixu Li',
        affiliation: 'University of California, Riverside',
        href: 'https://scholar.google.com/citations?user=iS48jG4AAAAJ',
      },
      {
        name: 'Andrey Bryutkin',
        affiliation: 'MIT',
        href: 'https://scholar.google.com/citations?user=0_SmsgIAAAAJ',
      },
      {
        name: 'Benjamin Savinson',
        affiliation: 'ETH Zurich',
        href: 'https://scholar.google.com/citations?user=Upe7-7kAAAAJ',
      },
      {
        name: 'Himanshu Gupta',
        affiliation: 'Arizona State University',
        href: 'https://scholar.google.com/citations?user=ydjuhxsAAAAJ',
      },
      {
        name: 'Pranav Viswanath',
        affiliation: 'University of Chicago · Argonne National Laboratory',
        href: 'https://scholar.google.com/citations?user=-yH7gIMAAAAJ',
      },
      {
        name: 'Ramakrishna Raju Gangaraju',
        affiliation: 'EarthDefine',
        href: 'https://www.linkedin.com/in/ramakrishna-raju-gangaraju/',
      },
      {
        name: 'Srinath Namburi',
        affiliation: 'University of Wisconsin-Madison',
        href: 'https://scholar.google.com/citations?user=brolZJEAAAAJ',
      },
      {
        name: 'Swaroop Mishra',
        affiliation: 'Arizona State University',
        href: 'https://scholar.google.com/citations?user=-7LK2SwAAAAJ',
      },
      {
        name: 'Yan Cao',
        affiliation: 'Peking University',
        href: 'https://www.researchgate.net/profile/Yan-Cao-28/research',
      },
      {
        name: 'Fabo Feng',
        affiliation: 'Shanghai Jiao Tong University',
        href: 'https://scholar.google.com/citations?user=5dRYFZEAAAAJ',
      },
      {
        name: 'Guangyao Xiao',
        affiliation: 'Shanghai Jiao Tong University',
        href: 'https://scholar.google.com/citations?user=XLWq7rMAAAAJ',
      },
      {
        name: 'Tianshu Yin',
        affiliation: 'University of Minnesota',
      },
      {
        name: 'Wenhao Liu',
        affiliation: 'Nanjing University',
        github: 'lwhere1314',
      },
      {
        name: 'Lukas Picek',
        affiliation: 'MIT',
        href: 'https://picekl.github.io/research-web/',
      },
    ],
  },
  {
    title: 'Advisors — AI',
    contributors: [
      {
        name: 'Ryan Marten',
        affiliation: 'Harbor Framework',
        href: 'https://scholar.google.com/citations?user=76LRPYuZDwkC',
      },
      {
        name: 'Alex Shaw',
        affiliation: 'Harbor Framework · Laude Institute',
        href: 'https://scholar.google.com/citations?user=Kx79YqEAAAAJ',
      },
      {
        name: 'Lin Shi',
        affiliation: 'Cornell Tech',
        href: 'https://scholar.google.com/citations?user=dLwY-1YAAAAJ',
      },
      {
        name: 'Mike A. Merrill',
        affiliation: 'Anthropic',
        href: 'https://scholar.google.com/citations?user=UtBcznsAAAAJ',
      },
      {
        name: 'Alex Dimakis',
        affiliation: 'University of California, Berkeley',
        href: 'https://scholar.google.com/citations?user=JSFmVQEAAAAJ',
      },
      {
        name: 'Jenia Jitsev',
        affiliation: 'Forschungszentrum Jülich · LAION',
        href: 'https://scholar.google.com/citations?user=p1FuAMkAAAAJ',
      },
      {
        name: 'Bodhisattwa Majumder',
        affiliation: 'Allen Institute for AI',
        href: 'https://scholar.google.com/citations?user=cEM1a5gAAAAJ',
      },
      {
        name: 'Peter Clark',
        affiliation: 'Allen Institute for AI',
        href: 'https://scholar.google.com/citations?user=o-5vyEsAAAAJ',
      },
      {
        name: 'Thomas Wolf',
        affiliation: 'Hugging Face',
        href: 'https://scholar.google.com/citations?user=D2H5EFEAAAAJ',
      },
      {
        name: 'Braden Hancock',
        affiliation: 'Laude Institute',
        href: 'https://scholar.google.com/citations?user=28y0Xe4AAAAJ',
      },
      {
        name: 'Andy Konwinski',
        affiliation: 'Laude Institute',
        href: 'https://scholar.google.com/citations?user=0VwIiIsAAAAJ',
      },
    ],
  },
  {
    title: 'Advisors — Science',
    contributors: [
      {
        name: 'Anima Anandkumar',
        affiliation: 'Caltech',
        href: 'https://scholar.google.com/citations?user=bEcLezcAAAAJ',
      },
      {
        name: 'Sara Beery',
        affiliation: 'MIT',
        href: 'https://scholar.google.com/citations?user=Hbr4c10AAAAJ',
      },
      {
        name: 'Jo Dunkley',
        affiliation: 'Princeton University',
        href: 'https://scholar.google.com/citations?user=dMvCg-UAAAAJ',
      },
      {
        name: 'J. Nathan Kutz',
        affiliation: 'University of Washington',
        href: 'https://scholar.google.com/citations?user=kfT42KEAAAAJ',
      },
      {
        name: 'Ching-Yao Lai',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=e1kTy34AAAAJ',
      },
      {
        name: 'Scott Linderman',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=6mD3I24AAAAJ',
      },
      {
        name: 'Emma Lundberg',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=yHnDnvcAAAAJ',
      },
      {
        name: 'Russ Poldrack',
        affiliation: 'Stanford University',
        href: 'https://scholar.google.com/citations?user=RbmLvDIAAAAJ',
      },
      {
        name: 'Aviv Regev',
        affiliation: 'Genentech',
        href: 'https://gene.com/scientists/our-scientists/aviv-regev',
      },
      {
        name: 'Risa Wechsler',
        affiliation: 'Stanford University · SLAC',
        href: 'https://scholar.google.com/citations?user=83Ahn20AAAAJ',
      },
    ],
  },
];

export function contributorHref(contributor: Contributor): string | undefined {
  if (contributor.github) return `https://github.com/${contributor.github}`;
  return contributor.href;
}

// 1K 1e3
// 1MB 1e6
// 1GB 1e9
// 1TB 1e12
// 1PB 1e15

const size_scales = [0, 1e3, 1e5, 1e6, 1e8, 1e9, 1e12, 1e14, 1e15]
const color_range = d3.scale
  .linear()
  .range(['blue', 'red'])
  .interpolate(d3.interpolateLab)

// .range(['purple', 'orange']) // "steelblue", "brown pink orange green", "blue"
// .interpolate(d3.interpolateLab) // interpolateHcl

const hue = d3.scale.category10() // colour hash

const size_color_range = color_range.ticks(size_scales.length - 1).map(v => color_range(v))
const linear = d3.scale.linear()

const size_scale_colors = d3.scale
  .linear()
  .domain(size_scales)
  .clamp(true)
  .range(size_color_range)

const size_luminance = d3.scale
  .linear()
  .domain([0, 1e9])
  .clamp(true)
  .range([90, 50])

const depth_luminance = d3.scale
  .linear() // .sqrt()
  .domain([0, 11])
  .clamp(true)
  .range([75, 96])

const greyScale = d3.scale
  .linear()
  // .range(['white', 'black'])
  .range(['black', 'white'])
  .domain([0, 12])
  .clamp(true)

let fill = colorByProp
// colorByProp // filetypes
// colorBySize // size
// colorByParentName colorful
// colorByParent // children
// byExtension

function colorByProp(d) {
  // using color prop
  return d.color
}

const ext_reg = /\.\w+$/

const tmpExtensions = new Set()
const randExt = {}

function byExtension(d, def) {
  const m = ext_reg.exec(d.name)
  const ext = m && m[0]
  if (ext) {
    /*
    // TODO use hashes for exploration!
    if (!randExt[ext]) {
      randExt[ext] = {
        r: Math.random() * 256 | 0,
        g: Math.random() * 256 | 0,
        b: Math.random() * 256 | 0
      }
    }
    const { r, g, b } = randExt[ext];
    return d3.lab(d3.rgb(r, g, b))
    */

    /*
    // 3786
    if (ext in extension_map_256_dark) { // 160
      // 92
      tmpExtensions.add(ext)
      const { r, g, b } = extension_map_256_dark[ext];
      return d3.lab(d3.rgb(r, g, b))
    }
    */

    if (ext in extension_map_ansi_dark) {
      // 160
      // 141
      tmpExtensions.add(ext)
      const { r, g, b } = extension_map_ansi_dark[ext]
      return d3.lab(d3.rgb(r, g, b))
    }
  }

  return def ? null : d3.rgb(0, 0, 0)
}

function colorBySize(d) {
  const c = d3.lab(size_scale_colors(d.value))
  c.l = size_luminance(d.value)
  return c
}

function colorByParent(d) {
  const p = getParent(d)
  // const c = d3.lab(hue(p.sum)); // size
  // const c = d3.lab(hue(p.count)); // number
  // // var c = d3.lab(hue(p.name)) // parent name
  const c = d3.lab(hue(p.children ? p.children.length : 0))
  // c.l = luminance(d.value)
  c.l = depth_luminance(d.depth)
  return c
}

function colorByParentName(d) {
  const p = getParent(d)
  const c = d3.lab(hue(p.name))
  c.l = size_luminance(d.sum || d.value)
  return c
}

function getParent(d) {
  let p = d
  while (p.depth > 1) p = p.parent
  return p
}

/*
const _color_cache = new Map()
function color_cache(x) {
  if (!_color_cache.has(x)) {
    _color_cache.set(x, colorScale(x))
  }

  return _color_cache.get(x)
}
*/

function colorByTypes(data) {
  childrenFirst(data, node => {
    const color = byExtension(node, true)
    if (color) {
      node.color = color
      return
    }

    const { children } = node
    const len = children && children.length
    if (!children || !len) {
      node.color = d3.lab(80, 0, 0)
      return
    }

    const v = node.size
    // if (!v) {
    //   node.color = d3.lab(50, 0, 0)
    //   return
    // }

    let l = 0
    let a = 0
    let b = 0

    for (let i = 0; i < len; i++) {
      const child = children[i]
      const color = child.color
      const weight = v
        ? child.size / v // weighted by size
        : 1 / len // weighted by count
      l += color.l * weight
      a += color.a * weight
      b += color.b * weight
    }

    // darker - saturated cores, lighter - whiter cores
    // l *= 1.03 // adjusts as it diffuses the directory
    // l = Math.max(Math.min(98, l), 2)

    node.color = d3.lab(l, a, b)
  })
}

function childrenFirst(data, func) {
  const { children } = data
  if (children) {
    children.forEach(v => {
      childrenFirst(v, func)
    })
  }

  func(data)
}

/*
archive = violet, compressed archive = violet + bold
audio = orange, video = orange + bold
*/

const extension_map_256_dark = {
  '.tar': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.tgz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.arj': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.taz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.lzh': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.lzma': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.tlz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.txz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.zip': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.z': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.Z': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.dz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.gz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.lz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.xz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.bz2': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.bz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.tbz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.tbz2': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.tz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.deb': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.rpm': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.jar': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.rar': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.ace': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.zoo': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.cpio': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.7z': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.rz': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.apk': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.gem': { l: '50', a: '15', b: '196', r: '108', g: '113' },
  '.jpg': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.JPG': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.jpeg': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.gif': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.bmp': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.pbm': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.pgm': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.ppm': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.tga': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.xbm': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.xpm': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.tif': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.tiff': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.png': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.PNG': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.svg': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.svgz': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.mng': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.pcx': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.dl': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.xcf': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.xwd': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.yuv': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.cgm': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.emf': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.eps': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.CR2': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.ico': { l: '60', a: '10', b: '0', r: '181', g: '137' },
  '.tex': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.rdf': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.owl': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.n3': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.ttl': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.nt': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.torrent': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.xml': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*Makefile': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*Rakefile': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*Dockerfile': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*build.xml': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*rc': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*1': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.nfo': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*README': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*README.txt': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*readme.txt': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.md': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '*README.markdown': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.ini': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.yml': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.cfg': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.conf': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.h': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.hpp': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.c': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.cpp': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.cxx': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.cc': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.objc': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.sqlite': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.go': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.sql': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.csv': { l: '65', a: '05', b: '161', r: '147', g: '161' },
  '.log': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.bak': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.aux': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.lof': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.lol': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.lot': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.out': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.toc': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.bbl': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.blg': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '*': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.part': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.incomplete': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.swp': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.tmp': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.temp': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.o': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.pyc': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.class': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.cache': { l: '45', a: '07', b: '117', r: '88', g: '110' },
  '.aac': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.au': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.flac': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mid': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.midi': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mka': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mp3': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mpc': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.ogg': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.opus': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.ra': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.wav': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.m4a': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.axa': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.oga': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.spx': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.xspf': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mov': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.MOV': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mpg': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mpeg': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.m2v': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mkv': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.ogm': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mp4': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.m4v': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.mp4v': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.vob': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.qt': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.nuv': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.wmv': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.asf': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.rm': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.rmvb': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.flc': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.avi': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.fli': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.flv': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.gl': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.m2ts': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.divx': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.webm': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.axv': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.anx': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.ogv': { l: '50', a: '50', b: '22', r: '203', g: '75' },
  '.ogx': { l: '50', a: '50', b: '22', r: '203', g: '75' }
}

const extension_map_ansi_dark = {
  '.txt': { r: '133', g: '153', b: '0' },
  '.org': { r: '133', g: '153', b: '0' },
  '.md': { r: '133', g: '153', b: '0' },
  '.mkd': { r: '133', g: '153', b: '0' },
  '.h': { r: '133', g: '153', b: '0' },
  '.hpp': { r: '133', g: '153', b: '0' },
  '.c': { r: '133', g: '153', b: '0' },
  '.C': { r: '133', g: '153', b: '0' },
  '.cc': { r: '133', g: '153', b: '0' },
  '.cpp': { r: '133', g: '153', b: '0' },
  '.cxx': { r: '133', g: '153', b: '0' },
  '.objc': { r: '133', g: '153', b: '0' },
  '.cl': { r: '133', g: '153', b: '0' },
  '.sh': { r: '133', g: '153', b: '0' },
  '.bash': { r: '133', g: '153', b: '0' },
  '.csh': { r: '133', g: '153', b: '0' },
  '.zsh': { r: '133', g: '153', b: '0' },
  '.el': { r: '133', g: '153', b: '0' },
  '.vim': { r: '133', g: '153', b: '0' },
  '.java': { r: '133', g: '153', b: '0' },
  '.pl': { r: '133', g: '153', b: '0' },
  '.pm': { r: '133', g: '153', b: '0' },
  '.py': { r: '133', g: '153', b: '0' },
  '.rb': { r: '133', g: '153', b: '0' },
  '.hs': { r: '133', g: '153', b: '0' },
  '.php': { r: '133', g: '153', b: '0' },
  '.htm': { r: '133', g: '153', b: '0' },
  '.html': { r: '133', g: '153', b: '0' },
  '.shtml': { r: '133', g: '153', b: '0' },
  '.erb': { r: '133', g: '153', b: '0' },
  '.haml': { r: '133', g: '153', b: '0' },
  '.xml': { r: '133', g: '153', b: '0' },
  '.rdf': { r: '133', g: '153', b: '0' },
  '.css': { r: '133', g: '153', b: '0' },
  '.sass': { r: '133', g: '153', b: '0' },
  '.scss': { r: '133', g: '153', b: '0' },
  '.less': { r: '133', g: '153', b: '0' },
  '.js': { r: '133', g: '153', b: '0' },
  '.coffee': { r: '133', g: '153', b: '0' },
  '.man': { r: '133', g: '153', b: '0' },
  '.0': { r: '133', g: '153', b: '0' },
  '.1': { r: '133', g: '153', b: '0' },
  '.2': { r: '133', g: '153', b: '0' },
  '.3': { r: '133', g: '153', b: '0' },
  '.4': { r: '133', g: '153', b: '0' },
  '.5': { r: '133', g: '153', b: '0' },
  '.6': { r: '133', g: '153', b: '0' },
  '.7': { r: '133', g: '153', b: '0' },
  '.8': { r: '133', g: '153', b: '0' },
  '.9': { r: '133', g: '153', b: '0' },
  '.l': { r: '133', g: '153', b: '0' },
  '.n': { r: '133', g: '153', b: '0' },
  '.p': { r: '133', g: '153', b: '0' },
  '.pod': { r: '133', g: '153', b: '0' },
  '.tex': { r: '133', g: '153', b: '0' },
  '.go': { r: '133', g: '153', b: '0' },
  '.sql': { r: '133', g: '153', b: '0' },
  '.csv': { r: '133', g: '153', b: '0' },
  '.sv': { r: '133', g: '153', b: '0' },
  '.svh': { r: '133', g: '153', b: '0' },
  '.v': { r: '133', g: '153', b: '0' },
  '.vh': { r: '133', g: '153', b: '0' },
  '.vhd': { r: '133', g: '153', b: '0' },
  '.bmp': { r: '181', g: '137', b: '0' },
  '.cgm': { r: '181', g: '137', b: '0' },
  '.dl': { r: '181', g: '137', b: '0' },
  '.dvi': { r: '181', g: '137', b: '0' },
  '.emf': { r: '181', g: '137', b: '0' },
  '.eps': { r: '181', g: '137', b: '0' },
  '.gif': { r: '181', g: '137', b: '0' },
  '.jpeg': { r: '181', g: '137', b: '0' },
  '.jpg': { r: '181', g: '137', b: '0' },
  '.JPG': { r: '181', g: '137', b: '0' },
  '.mng': { r: '181', g: '137', b: '0' },
  '.pbm': { r: '181', g: '137', b: '0' },
  '.pcx': { r: '181', g: '137', b: '0' },
  '.pdf': { r: '181', g: '137', b: '0' },
  '.pgm': { r: '181', g: '137', b: '0' },
  '.png': { r: '181', g: '137', b: '0' },
  '.PNG': { r: '181', g: '137', b: '0' },
  '.ppm': { r: '181', g: '137', b: '0' },
  '.pps': { r: '181', g: '137', b: '0' },
  '.ppsx': { r: '181', g: '137', b: '0' },
  '.ps': { r: '181', g: '137', b: '0' },
  '.svg': { r: '181', g: '137', b: '0' },
  '.svgz': { r: '181', g: '137', b: '0' },
  '.tga': { r: '181', g: '137', b: '0' },
  '.tif': { r: '181', g: '137', b: '0' },
  '.tiff': { r: '181', g: '137', b: '0' },
  '.xbm': { r: '181', g: '137', b: '0' },
  '.xcf': { r: '181', g: '137', b: '0' },
  '.xpm': { r: '181', g: '137', b: '0' },
  '.xwd': { r: '181', g: '137', b: '0' },
  '.yuv': { r: '181', g: '137', b: '0' },
  '.aac': { r: '181', g: '137', b: '0' },
  '.au': { r: '181', g: '137', b: '0' },
  '.flac': { r: '181', g: '137', b: '0' },
  '.m4a': { r: '181', g: '137', b: '0' },
  '.mid': { r: '181', g: '137', b: '0' },
  '.midi': { r: '181', g: '137', b: '0' },
  '.mka': { r: '181', g: '137', b: '0' },
  '.mp3': { r: '181', g: '137', b: '0' },
  '.mpa': { r: '181', g: '137', b: '0' },
  '.mpeg': { r: '181', g: '137', b: '0' },
  '.mpg': { r: '181', g: '137', b: '0' },
  '.ogg': { r: '181', g: '137', b: '0' },
  '.opus': { r: '181', g: '137', b: '0' },
  '.ra': { r: '181', g: '137', b: '0' },
  '.wav': { r: '181', g: '137', b: '0' },
  '.anx': { r: '181', g: '137', b: '0' },
  '.asf': { r: '181', g: '137', b: '0' },
  '.avi': { r: '181', g: '137', b: '0' },
  '.axv': { r: '181', g: '137', b: '0' },
  '.flc': { r: '181', g: '137', b: '0' },
  '.fli': { r: '181', g: '137', b: '0' },
  '.flv': { r: '181', g: '137', b: '0' },
  '.gl': { r: '181', g: '137', b: '0' },
  '.m2v': { r: '181', g: '137', b: '0' },
  '.m4v': { r: '181', g: '137', b: '0' },
  '.mkv': { r: '181', g: '137', b: '0' },
  '.mov': { r: '181', g: '137', b: '0' },
  '.MOV': { r: '181', g: '137', b: '0' },
  '.mp4': { r: '181', g: '137', b: '0' },
  '.mp4v': { r: '181', g: '137', b: '0' },
  '.nuv': { r: '181', g: '137', b: '0' },
  '.ogm': { r: '181', g: '137', b: '0' },
  '.ogv': { r: '181', g: '137', b: '0' },
  '.ogx': { r: '181', g: '137', b: '0' },
  '.qt': { r: '181', g: '137', b: '0' },
  '.rm': { r: '181', g: '137', b: '0' },
  '.rmvb': { r: '181', g: '137', b: '0' },
  '.swf': { r: '181', g: '137', b: '0' },
  '.vob': { r: '181', g: '137', b: '0' },
  '.webm': { r: '181', g: '137', b: '0' },
  '.wmv': { r: '181', g: '137', b: '0' },
  '.doc': { r: '220', g: '50', b: '47' },
  '.docx': { r: '220', g: '50', b: '47' },
  '.rtf': { r: '220', g: '50', b: '47' },
  '.odt': { r: '220', g: '50', b: '47' },
  '.dot': { r: '220', g: '50', b: '47' },
  '.dotx': { r: '220', g: '50', b: '47' },
  '.ott': { r: '220', g: '50', b: '47' },
  '.xls': { r: '220', g: '50', b: '47' },
  '.xlsx': { r: '220', g: '50', b: '47' },
  '.ods': { r: '220', g: '50', b: '47' },
  '.ots': { r: '220', g: '50', b: '47' },
  '.ppt': { r: '220', g: '50', b: '47' },
  '.pptx': { r: '220', g: '50', b: '47' },
  '.odp': { r: '220', g: '50', b: '47' },
  '.otp': { r: '220', g: '50', b: '47' },
  '.fla': { r: '220', g: '50', b: '47' },
  '.psd': { r: '220', g: '50', b: '47' },
  '.7z': { r: '211', g: '54', b: '130' },
  '.apk': { r: '211', g: '54', b: '130' },
  '.arj': { r: '211', g: '54', b: '130' },
  '.bin': { r: '211', g: '54', b: '130' },
  '.bz': { r: '211', g: '54', b: '130' },
  '.bz2': { r: '211', g: '54', b: '130' },
  '.cab': { r: '211', g: '54', b: '130' },
  '.deb': { r: '211', g: '54', b: '130' },
  '.dmg': { r: '211', g: '54', b: '130' },
  '.gem': { r: '211', g: '54', b: '130' },
  '.gz': { r: '211', g: '54', b: '130' },
  '.iso': { r: '211', g: '54', b: '130' },
  '.jar': { r: '211', g: '54', b: '130' },
  '.msi': { r: '211', g: '54', b: '130' },
  '.rar': { r: '211', g: '54', b: '130' },
  '.rpm': { r: '211', g: '54', b: '130' },
  '.tar': { r: '211', g: '54', b: '130' },
  '.tbz': { r: '211', g: '54', b: '130' },
  '.tbz2': { r: '211', g: '54', b: '130' },
  '.tgz': { r: '211', g: '54', b: '130' },
  '.tx': { r: '211', g: '54', b: '130' },
  '.war': { r: '211', g: '54', b: '130' },
  '.xpi': { r: '211', g: '54', b: '130' },
  '.xz': { r: '211', g: '54', b: '130' },
  '.z': { r: '211', g: '54', b: '130' },
  '.Z': { r: '211', g: '54', b: '130' },
  '.zip': { r: '211', g: '54', b: '130' },
  '.ANSI-30-black': { r: '7', g: '54', b: '66' },
  '.ANSI-01;30-brblack': { r: '7', g: '54', b: '66' },
  '.ANSI-31-red': { r: '220', g: '50', b: '47' },
  '.ANSI-01;31-brred': { r: '220', g: '50', b: '47' },
  '.ANSI-32-green': { r: '133', g: '153', b: '0' },
  '.ANSI-01;32-brgreen': { r: '133', g: '153', b: '0' },
  '.ANSI-33-yellow': { r: '181', g: '137', b: '0' },
  '.ANSI-01;33-bryellow': { r: '181', g: '137', b: '0' },
  '.ANSI-34-blue': { r: '38', g: '139', b: '210' },
  '.ANSI-01;34-brblue': { r: '38', g: '139', b: '210' },
  '.ANSI-35-magenta': { r: '211', g: '54', b: '130' },
  '.ANSI-01;35-brmagenta': { r: '211', g: '54', b: '130' },
  '.ANSI-36-cyan': { r: '42', g: '161', b: '152' },
  '.ANSI-01;36-brcyan': { r: '42', g: '161', b: '152' },
  '.ANSI-37-white': { r: '238', g: '232', b: '213' },
  '.ANSI-01;37-brwhite': { r: '238', g: '232', b: '213' },
  '.log': { r: '133', g: '153', b: '0' },
  '*~': { r: '133', g: '153', b: '0' },
  '*#': { r: '133', g: '153', b: '0' },
  '.bak': { r: '181', g: '137', b: '0' },
  '.BAK': { r: '181', g: '137', b: '0' },
  '.old': { r: '181', g: '137', b: '0' },
  '.OLD': { r: '181', g: '137', b: '0' },
  '.org_archive': { r: '181', g: '137', b: '0' },
  '.off': { r: '181', g: '137', b: '0' },
  '.OFF': { r: '181', g: '137', b: '0' },
  '.dist': { r: '181', g: '137', b: '0' },
  '.DIST': { r: '181', g: '137', b: '0' },
  '.orig': { r: '181', g: '137', b: '0' },
  '.ORIG': { r: '181', g: '137', b: '0' },
  '.swp': { r: '181', g: '137', b: '0' },
  '.swo': { r: '181', g: '137', b: '0' },
  '*,v': { r: '181', g: '137', b: '0' },
  '.gpg': { r: '38', g: '139', b: '210' },
  '.pgp': { r: '38', g: '139', b: '210' },
  '.asc': { r: '38', g: '139', b: '210' },
  '.3des': { r: '38', g: '139', b: '210' },
  '.aes': { r: '38', g: '139', b: '210' },
  '.enc': { r: '38', g: '139', b: '210' },
  '.sqlite': { r: '38', g: '139', b: '210' }
}

// More color references
// https://github.com/d3/d3-scale-chromatic
// http://bl.ocks.org/emmasaunders/52fa83767df27f1fc8b3ee2c6d372c74
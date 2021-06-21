const AREABUSINESS = {
  1: { // 普通区域
    'nosetting': [4, 6, 10],
    'setting': [7]
  },
  3: { // 禁入区域
    'nosetting': [1, 2, 3, 4, 5, 8, 9, 10],
    'setting': [6, 7]
  },
  4: { // 井下区域
    'nosetting': [0, 5, 6, 10],
    'setting': [4, 7]
  },
  5: { // 猴车区域
    'nosetting': [4, 5, 6, 10],
    'setting': [7]
  },
  1001: { // 特殊区域
    'nosetting': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'setting': []
  },
  2000: { // 工作面区域
    'nosetting': [4, 5, 6],
    'setting': [7]
  }
}

export {AREABUSINESS}
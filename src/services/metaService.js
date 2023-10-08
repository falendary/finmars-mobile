
export default {
	getIconColor(letter) {
		const colorMap = {
			'A': '#FFADAD',
			'B': '#FFD6A5',
			'C': '#FDFFB6',
			'D': '#CAFFBF',
			'E': '#9BF6FF',
			'F': '#A0C4FF',
			'G': '#BDB2FF',
			'H': '#FFC6FF',
			'I': '#FFAFCC',
			'J': '#FFC3A0',
			'K': '#FF61A6',
			'L': '#70F3FF',
			'M': '#9448BC',
			'N': '#A3A380',
			'O': '#FFA343',
			'P': '#B671D5',
			'Q': '#DDBDF1',
			'R': '#4B8BBE',
			'S': '#CCE7E8',
			'T': '#EFB839',
			'U': '#FF4242',
			'V': '#CAA8F5',
			'W': '#DFF2BF',
			'X': '#D0F4DE',
			'Y': '#AAEFDF',
			'Z': '#BDC0BA'
		}
		return colorMap[letter.toUpperCase()] || 'gray'  // default to gray if letter is not found
	}
}

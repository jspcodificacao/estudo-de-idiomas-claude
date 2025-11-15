interface KeyboardSection {
  title: string
  keys: string[]
}

interface KeyboardLayout {
  [key: string]: KeyboardSection[]
}

interface VirtualKeyboardProps {
  idioma: string
  onKeyPress: (character: string) => void
}

// Define keyboard layouts for each language
const keyboardLayouts: KeyboardLayout = {
  alemao: [
    {
      title: 'LETRAS E MARCADORES DO IDIOMA',
      keys: ['ß'],
    },
    {
      title: 'VOGAIS IPA',
      keys: ['ə', 'ɪ', 'ɛ', 'ʏ', 'ɐ', 'ʊ', 'ɔ'],
    },
    {
      title: 'CONSOANTES IPA',
      keys: ['ŋ', 'ʁ', 'ʒ', 'ʃ', 'ɲ'],
    },
    {
      title: 'SINAIS DIACRÍTICOS',
      keys: ['\u0329', '\u032F'], // ̩ (syllabicity mark), ̯ (subscript arch)
    },
    {
      title: 'TRAÇOS SUPRASSEGMENTAIS',
      keys: ['ˈ', 'ˌ', 'ː'],
    },
    {
      title: 'OUTROS SÍMBOLOS IPA',
      keys: ['\u0361'], // ͡ (top tie bar)
    },
  ],
}

export default function VirtualKeyboard({ idioma, onKeyPress }: VirtualKeyboardProps) {
  // Get the layout for the selected language, or empty array if not found
  const layout = keyboardLayouts[idioma] || []

  // If no layout exists for this language, show message
  if (layout.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 text-center">
        <p className="text-sm text-gray-600">
          Teclado virtual não disponível para este idioma.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-300 shadow-sm">
      {layout.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          {/* Section Title */}
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {section.title}
          </h3>

          {/* Keys */}
          <div className="flex flex-wrap gap-2">
            {section.keys.map((key, keyIndex) => (
              <button
                key={keyIndex}
                type="button"
                onClick={() => onKeyPress(key)}
                className="
                  min-w-[3rem] px-3 py-3
                  bg-white hover:bg-indigo-50
                  border border-gray-300 hover:border-indigo-400
                  rounded-lg
                  font-mono text-2xl
                  text-gray-800 hover:text-indigo-700
                  transition-all duration-150
                  shadow-sm hover:shadow-md
                  active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                "
                title={`Inserir: ${key}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

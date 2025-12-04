'use client'

import { SUPPORTED_LANGUAGES, VOICE_STYLES } from '@/lib/ttsOptions'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setVoiceLanguage, setVoiceStyle } from '@/redux/settingsSlice'

const STYLE_ICONS: Record<string, string> = {
  neutral: '⚪',
  calm: '🌊',
  hype: '🔥',
  narrator: '🎙️',
  sinister: '🌑',
}

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  ja: '🇯🇵',
}

export default function VoiceOptionsPanel() {
  const dispatch = useAppDispatch()
  const { voiceLanguage, voiceStyle } = useAppSelector((state) => state.settings)

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-omega-text">Voice Options</h3>
          <span className="text-xs text-omega-text/40 bg-omega-accent/20 text-omega-accent px-2 py-0.5 rounded">
            Multilingual + Emotions
          </span>
        </div>
        <div className="space-y-4">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-medium text-omega-text/80 mb-2 flex items-center gap-2">
              <span>Language</span>
              {LANGUAGE_FLAGS[voiceLanguage] && (
                <span className="text-base">{LANGUAGE_FLAGS[voiceLanguage]}</span>
              )}
            </label>
            <select
              value={voiceLanguage}
              onChange={(e) => dispatch(setVoiceLanguage(e.target.value))}
              className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {LANGUAGE_FLAGS[lang.id]} {lang.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-omega-text/50 mt-1">
              Generate narration in English, Spanish, or Japanese
            </p>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-medium text-omega-text/80 mb-2 flex items-center gap-2">
              <span>Voice Style</span>
              {STYLE_ICONS[voiceStyle] && (
                <span className="text-base">{STYLE_ICONS[voiceStyle]}</span>
              )}
            </label>
            <select
              value={voiceStyle}
              onChange={(e) => dispatch(setVoiceStyle(e.target.value))}
              className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
            >
              {VOICE_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {STYLE_ICONS[style.id]} {style.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-omega-text/50 mt-1">
              Choose emotional tone: {voiceStyle === 'neutral' && 'Balanced delivery'}
              {voiceStyle === 'calm' && 'Soothing and stable'}
              {voiceStyle === 'hype' && 'Energetic and dynamic'}
              {voiceStyle === 'narrator' && 'Authoritative and clear'}
              {voiceStyle === 'sinister' && 'Dark and mysterious'}
            </p>
          </div>

          {/* Preview Badge */}
          <div className="bg-omega-bg border border-omega-accent/20 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {LANGUAGE_FLAGS[voiceLanguage]} {STYLE_ICONS[voiceStyle]}
              </span>
              <div className="text-xs">
                <div className="font-semibold text-omega-text">
                  {SUPPORTED_LANGUAGES.find((l) => l.id === voiceLanguage)?.label} •{' '}
                  {VOICE_STYLES.find((s) => s.id === voiceStyle)?.label}
                </div>
                <div className="text-omega-text/50">Active settings</div>
              </div>
            </div>
            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
              ✓ Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


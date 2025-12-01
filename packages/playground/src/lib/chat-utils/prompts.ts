import guiAgentSeedPromptZh from '@/prompts/gui-agent-seed.zh.txt?raw'
import guiAgentUiTarsPromptZh from '@/prompts/gui-agent-ui-tars.zh.txt?raw'
import guiAgentSeedPromptEn from '@/prompts/gui-agent-seed.en.txt?raw'
import guiAgentUiTarsPromptEn from '@/prompts/gui-agent-ui-tars.en.txt?raw'
import groundingAgentQwenPromptAllLang from '@/prompts/ground-agent-qwen.txt?raw'
import groundingAgentOpenCuaPromptAllLang from '@/prompts/ground-agent-opencua.txt?raw'
import groundingAgentUiTarsPromptAllLang from '@/prompts/ground-agent-uitars.txt?raw'
import plannerAgentPromptAllLang from '@/prompts/planner-agent.txt?raw'
import reflectionPromptAllLang from '@/prompts/reflection-agent.txt?raw'

export function plannerPrompt({ userLanguage }: { userLanguage: 'zh' | 'en' }) {
  return plannerAgentPromptAllLang.replaceAll('{LANGUAGE}', userLanguage === 'zh' ? '中文' : 'English')
}

export function formatGroundingPrompt(
  input: string,
  { userLanguage, screenSize }: { userLanguage: 'zh' | 'en'; screenSize: { width: number; height: number } },
) {
  return input
    .replaceAll('{LANGUAGE}', userLanguage === 'zh' ? '中文' : 'English')
    .replaceAll('{screen_width}', `${screenSize.width}`)
    .replaceAll('{screen_height}', `${screenSize.height}`)
}

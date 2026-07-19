import { useState } from "react";

export type PromptPack = { id: string; title: string; mode: string; prompt: string };

export default function PromptPackIsland({ routeId, prompts }: { locale: string; routeId: string; prompts: PromptPack[] }) {
  const [selectedId, setSelectedId] = useState(prompts[0]?.id ?? "");
  const [status, setStatus] = useState("");
  const prompt = prompts.find((item) => item.id === selectedId) ?? prompts[0];
  async function copy() { if (!prompt) return; await navigator.clipboard.writeText(prompt.prompt); setStatus("Prompt copied."); }
  return <section className="island-panel" aria-labelledby={`prompts-${routeId}`}><p className="public-kicker">AI facilitation</p><h2 id={`prompts-${routeId}`}>Prompt pack</h2>
    {prompt ? <><label className="island-field">Choose a prompt<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{prompts.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><article className="prompt-preview"><h3>{prompt.title}</h3><p>{prompt.mode}</p><pre>{prompt.prompt}</pre><button type="button" onClick={() => void copy()}>Copy prompt</button><span role="status">{status}</span></article></> : <p>No prompts are available for this guide.</p>}
  </section>;
}

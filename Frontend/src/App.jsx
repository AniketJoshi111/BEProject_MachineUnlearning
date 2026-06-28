import { useState, useEffect } from "react";
import axios from "axios";

// const API = "https://beproject-machineunlearning.onrender.com";
const API = "http://127.0.0.1:8000";

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
  </svg>
);

const SkullIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
    <path d="M8 20v2h8v-2"/>
    <path d="m12.5 17-.5-1-.5 1h1z"/>
    <path d="M16 20a2 2 0 0 0 1.956-2.4l-1.2-6A7 7 0 1 0 7.244 11.6l-1.2 6A2 2 0 0 0 8 20Z"/>
  </svg>

);

const TrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const PDFIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// ─── Unlearning Dashboard Component ───────────────────────────────────────────
const NUM_SHARDS = 5;
const NUM_SLICES = 3;

const SLICE_COLORS = {
  idle:      { bg: "rgba(30,41,59,0.6)",    border: "#334155", color: "#64748b" },
  training:  { bg: "rgba(59,130,246,0.15)",  border: "#3b82f6", color: "#93c5fd" },
  trained:   { bg: "rgba(16,185,129,0.15)",  border: "#10b981", color: "#34d399" },
  poisoned:  { bg: "rgba(244,63,94,0.15)",   border: "#f43f5e", color: "#fb7185" },
  unlearning:{ bg: "rgba(245,158,11,0.15)",  border: "#f59e0b", color: "#fcd34d" },
  clean:     { bg: "rgba(16,185,129,0.25)",  border: "#34d399", color: "#6ee7b7" },
};

const PHASE_BANNERS = {
  idle:    { bg: "rgba(30,41,59,0.6)",    border: "#334155", color: "#64748b", text: "Visualizer ready — run Train, Attack or Unlearn to see the SISA process" },
  train:   { bg: "rgba(59,130,246,0.1)",  border: "#3b82f6", color: "#93c5fd", text: "Phase 1 — Training SISA shards on clean PDF feature dataset" },
  attack:  { bg: "rgba(244,63,94,0.1)",   border: "#f43f5e", color: "#fb7185", text: "Phase 2 — Poisoned samples injected into model shards" },
  unlearn: { bg: "rgba(245,158,11,0.1)",  border: "#f59e0b", color: "#fcd34d", text: "Phase 3 — Retraining affected shards from clean checkpoints" },
  done:    { bg: "rgba(16,185,129,0.1)",  border: "#10b981", color: "#34d399", text: "Unlearning complete — model restored to clean state" },
};

const POISON_TARGETS = [{ s: 1, sl: 1 }, { s: 2, sl: 2 }, { s: 3, sl: 0 }, { s: 4, sl: 1 }];

function UnlearningDashboard({ pipelinePhase }) {
  const [slices, setSlices] = useState(
    Array.from({ length: NUM_SHARDS }, () => Array(NUM_SLICES).fill("idle"))
  );
  const [phase, setPhase] = useState("idle");
  const [accuracy, setAccuracy] = useState(null);

  const setSlice = (s, sl, status) => {
    setSlices(prev => {
      const next = prev.map(r => [...r]);
      next[s][sl] = status;
      return next;
    });
  };

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const animateTrain = async () => {
    setPhase("train");
    for (let s = 0; s < NUM_SHARDS; s++) {
      for (let sl = 0; sl < NUM_SLICES; sl++) {
        setSlice(s, sl, "training");
        await delay(300);
        setSlice(s, sl, "trained");
        await delay(150);
      }
    }
    setAccuracy(94);
  };

  const animateAttack = async () => {
    setPhase("attack");
    for (const p of POISON_TARGETS) {
      await delay(400);
      setSlice(p.s, p.sl, "poisoned");
    }
    setAccuracy(88);
  };

  const animateUnlearn = async () => {
    setPhase("unlearn");
    const affectedShards = [...new Set(POISON_TARGETS.map(p => p.s))];
    for (const s of affectedShards) {
      const poisonSlice = POISON_TARGETS.find(p => p.s === s).sl;
      for (let sl = poisonSlice; sl < NUM_SLICES; sl++) {
        setSlice(s, sl, "unlearning");
        await delay(350);
        setSlice(s, sl, "clean");
        await delay(200);
      }
    }
    setAccuracy(93);
    setPhase("done");
  };

  useEffect(() => {
    if (pipelinePhase === "train")   animateTrain();
    if (pipelinePhase === "attack")  animateAttack();
    if (pipelinePhase === "unlearn") animateUnlearn();
  }, [pipelinePhase]);

  const banner = PHASE_BANNERS[phase] || PHASE_BANNERS.idle;

  return (
    <div style={{
      width: "100%", maxWidth: 1100,
      background: "rgba(15,20,40,0.6)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18, padding: "14px 20px",
      backdropFilter: "blur(12px)",
      position: "relative", overflow: "hidden",
      marginTop: 12, flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)"
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#64748b" }}>
          SISA Unlearning Visualizer
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 10, color: "#475569" }}>
          {Object.entries(SLICE_COLORS).map(([status, c]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: c.border }} />
              {status}
            </div>
          ))}
        </div>
      </div>

      {/* Phase banner */}
      <div style={{
        padding: "5px 12px", borderRadius: 8, marginBottom: 10,
        background: banner.bg, border: `1px solid ${banner.border}`,
        fontSize: 11, color: banner.color, fontWeight: 500,
        transition: "all 0.4s ease",
      }}>
        {banner.text}
      </div>

      {/* Shard grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((shard, si) => (
          <div key={si} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11, color: "#64748b", width: 52, flexShrink: 0 }}>
              Shard {si + 1}
            </div>
            <div style={{ display: "flex", gap: 5, flex: 1 }}>
              {shard.map((status, sli) => {
                const c = SLICE_COLORS[status] || SLICE_COLORS.idle;
                return (
                  <div key={sli} style={{
                    flex: 1, height: 26, borderRadius: 5,
                    background: c.bg, border: `1px solid ${c.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 600, color: c.color,
                    transition: "all 0.35s ease",
                    position: "relative", overflow: "hidden",
                  }}>
                    S{sli + 1}
                    {status === "poisoned" && <span style={{ marginLeft: 3, fontSize: 9 }}>☠</span>}
                    {status === "clean"    && <span style={{ marginLeft: 3, fontSize: 9 }}>✓</span>}
                    {status === "unlearning" && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, height: 2,
                        width: "100%", background: "#f59e0b",
                        animation: "shimmer-dash 1.2s linear infinite",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Mini shard status bar */}
            <div style={{ width: 56, flexShrink: 0 }}>
              {accuracy && (
                <>
                  <div style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}>
                    {shard.some(s => s === "poisoned") ? "compromised" :
                     shard.some(s => s === "clean")    ? "restored"    :
                     shard.every(s => s === "trained") ? "trained"     : ""}
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: shard.some(s => s === "poisoned") ? "38%" :
                             shard.some(s => s === "clean")    ? "91%" :
                             shard.every(s => s === "trained") ? "94%" : "0%",
                      background: shard.some(s => s === "poisoned") ? "#f43f5e" : "#10b981",
                      transition: "all 0.5s ease",
                    }} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom metrics */}
      {accuracy && (
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>Model accuracy</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3, width: `${accuracy}%`,
                  background: accuracy < 70 ? "#f43f5e" : "#10b981",
                  transition: "all 0.6s ease",
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: accuracy < 70 ? "#fb7185" : "#34d399" }}>
                {accuracy}%
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#475569" }}>
            <span>Shards: <span style={{ color: "#e2e8f0" }}>{NUM_SHARDS}</span></span>
            <span>Slices: <span style={{ color: "#e2e8f0" }}>{NUM_SLICES}</span></span>
            <span>Poisoned slices: <span style={{ color: "#fb7185" }}>{POISON_TARGETS.length}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [globalStatus, setGlobalStatus] = useState("");
  const [steps, setSteps] = useState({ train: "idle", attack: "idle", unlearn: "idle", predict: "idle" });
  const [pipelinePhase, setPipelinePhase] = useState(null);

  const setStep = (key, val) => setSteps((s) => ({ ...s, [key]: val }));

  const handleTrain = async () => {
    setStep("train", "loading");
    setGlobalStatus("Training the detection model on PDF feature dataset...");
    setPipelinePhase("train");
    try {
      await axios.post(`${API}/train`);
      setStep("train", "done");
      setGlobalStatus("Model trained successfully!");
    } catch {
      setStep("train", "error");
      setGlobalStatus("Training failed. Is the backend running?");
    }
  };

  const handleAttack = async () => {
    setStep("attack", "loading");
    setGlobalStatus("Injecting poisoned samples to simulate an adversarial attack...");
    setPipelinePhase("attack");
    try {
      await axios.post(`${API}/attack`);
      setStep("attack", "done");
      setGlobalStatus("Poisoning attack simulated. Model may be compromised.");
    } catch {
      setStep("attack", "error");
      setGlobalStatus("Attack simulation failed.");
    }
  };

  const handleUnlearn = async () => {
    setStep("unlearn", "loading");
    setGlobalStatus("Running machine unlearning to purge poisoned data influence...");
    setPipelinePhase("unlearn");
    try {
      await axios.post(`${API}/unlearn`);
      setStep("unlearn", "done");
      setGlobalStatus("Unlearning complete. Model restored to clean state.");
    } catch {
      setStep("unlearn", "error");
      setGlobalStatus("Unlearning failed.");
    }
  };

  const handlePredict = async () => {
    if (!file) return;
    setStep("predict", "loading");
    setResult(null);
    setGlobalStatus("Analyzing PDF features with trained classifier...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const prediction =
        res.data.result ||
        res.data.prediction ||
        res.data.label ||
        res.data.class ||
        (typeof res.data === "string" ? res.data : null);
      setResult(prediction);
      setStep("predict", "done");
      setGlobalStatus("Analysis complete.");
    } catch {
      setStep("predict", "error");
      setGlobalStatus("Prediction failed. Check backend connection.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
  };

  const isMalicious = result === "Malicious";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        body { font-family: 'Inter', sans-serif; background: #0a0e1a; color: #e2e8f0; }
        .app {
          width: 1280px;
          height: 800px;
          background: radial-gradient(ellipse at 25% 25%, #1a1f3a 0%, #0a0e1a 55%, #0d1117 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 48px 16px;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          overflow: hidden;
          gap: 12px;
        }
        .header { text-align: center; flex-shrink: 0; }
        .header-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 100px; padding: 4px 12px; font-size: 10px; font-weight: 500; color: #a5b4fc; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
        .header h1 { font-size: 26px; font-weight: 700; background: linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 50%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; margin-bottom: 4px; }
        .header p { color: #64748b; font-size: 12px; max-width: 480px; margin: 0 auto; line-height: 1.4; }
        .main-grid { width: 100%; max-width: 1100px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex-shrink: 0; }
        .card { background: rgba(15,20,40,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px 20px; backdrop-filter: blur(12px); position: relative; overflow: hidden; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent); }
        .card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px; }
        .pipeline { display: flex; flex-direction: column; gap: 8px; }
        .step-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.2s ease; color: #e2e8f0; text-align: left; position: relative; overflow: hidden; }
        .step-btn:hover { background: rgba(255,255,255,0.06); transform: translateX(3px); }
        .step-btn:active { transform: translateX(0); }
        .step-btn.loading { pointer-events: none; }
        .step-btn.train { --accent: #6366f1; }
        .step-btn.attack { --accent: #f43f5e; }
        .step-btn.unlearn { --accent: #10b981; }
        .step-btn:hover { border-color: var(--accent, rgba(255,255,255,0.15)); }
        .step-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .step-btn.train .step-icon { color: #818cf8; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); }
        .step-btn.attack .step-icon { color: #fb7185; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); }
        .step-btn.unlearn .step-icon { color: #34d399; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); }
        .step-info { flex: 1; }
        .step-label { font-size: 13px; font-weight: 600; margin-bottom: 1px; }
        .step-desc { font-size: 11px; color: #64748b; }
        .step-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #1e293b; border: 1px solid #334155; transition: all 0.3s ease; flex-shrink: 0; }
        .step-btn.done .step-status-dot { background: #10b981; border-color: #10b981; box-shadow: 0 0 8px #10b981; }
        .step-btn.error .step-status-dot { background: #f43f5e; border-color: #f43f5e; box-shadow: 0 0 8px #f43f5e; }
        .step-btn.loading .step-status-dot { background: #f59e0b; border-color: #f59e0b; animation: pulse-dot 1s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .step-btn.loading::after { content:''; position:absolute; bottom:0; left:0; height:2px; width:100%; background: linear-gradient(90deg, transparent, var(--accent, #818cf8), transparent); animation: shimmer 1.5s linear infinite; }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes shimmer-dash { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .step-number { font-size: 9px; font-weight: 700; color: #334155; position: absolute; top: 6px; right: 10px; }
        .upload-zone { border: 2px dashed rgba(99,102,241,0.3); border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s ease; background: rgba(99,102,241,0.03); position: relative; }
        .upload-zone:hover, .upload-zone.drag-over { border-color: rgba(99,102,241,0.6); background: rgba(99,102,241,0.07); }
        .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .upload-icon { color: #4f46e5; margin-bottom: 8px; opacity: 0.7; }
        .upload-main { font-size: 13px; font-weight: 500; color: #c7d2fe; margin-bottom: 3px; }
        .upload-sub { font-size: 11px; color: #475569; }
        .file-chip { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 12px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 100px; font-size: 12px; color: #a5b4fc; max-width: 100%; }
        .file-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .analyze-btn { width: 100%; margin-top: 10px; padding: 11px; border: none; border-radius: 10px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
        .analyze-btn:hover { background: linear-gradient(135deg, #4338ca, #4f46e5); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }
        .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .analyze-btn.running { background: linear-gradient(135deg, #3730a3, #4338ca); pointer-events: none; }
        .result-card { margin-top: 10px; padding: 12px 14px; border-radius: 10px; display: flex; align-items: center; gap: 12px; animation: fadeIn 0.4s ease; }
        .result-card.malicious { background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); }
        .result-card.benign { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); }
        .result-indicator { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; }
        .result-card.malicious .result-indicator { background: rgba(244,63,94,0.2); }
        .result-card.benign .result-indicator { background: rgba(16,185,129,0.2); }
        .result-label { font-size: 10px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .result-value { font-size: 18px; font-weight: 700; }
        .result-card.malicious .result-value { color: #fb7185; }
        .result-card.benign .result-value { color: #34d399; }
        .result-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .status-bar { width: 100%; max-width: 1100px; padding: 10px 18px; background: rgba(15,20,40,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #94a3b8; backdrop-filter: blur(12px); flex-shrink: 0; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; flex-shrink: 0; animation: pulse-dot 2s ease-in-out infinite; }
        .header-icon { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.1)); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; margin-bottom: 10px; box-shadow: 0 0 40px rgba(99,102,241,0.15); }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); margin: 12px 0; }
        .legend { display: flex; gap: 14px; font-size: 11px; color: #475569; }
        .legend-item { display: flex; align-items: center; gap: 5px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <div className="app">
        <header className="header">
          <div className="header-icon"><ShieldIcon /></div>
          <div className="header-badge">
            <span style={{width:6,height:6,background:'#10b981',borderRadius:'50%',display:'inline-block'}}></span>
            Machine Unlearning Security System
          </div>
          <h1>Malicious PDF Detection</h1>
          <p>Adversarial-resilient classification powered by machine unlearning — detect, attack, and recover.</p>
        </header>

        <div className="main-grid">
          <div className="card">
            <div className="card-title">Model Pipeline</div>
            <div className="pipeline">
              <button className={`step-btn train ${steps.train}`} onClick={handleTrain}>
                <div className="step-icon"><TrainIcon /></div>
                <div className="step-info">
                  <div className="step-label">Train Model</div>
                  <div className="step-desc">Fit classifier on PDF feature dataset</div>
                </div>
                <div className="step-status-dot"></div>
                <span className="step-number">01</span>
              </button>
              <button className={`step-btn attack ${steps.attack}`} onClick={handleAttack}>
                <div className="step-icon"><SkullIcon /></div>
                <div className="step-info">
                  <div className="step-label">Simulate Attack</div>
                  <div className="step-desc">Inject poisoned samples into model</div>
                </div>
                <div className="step-status-dot"></div>
                <span className="step-number">02</span>
              </button>
              <button className={`step-btn unlearn ${steps.unlearn}`} onClick={handleUnlearn}>
                <div className="step-icon"><BrainIcon /></div>
                <div className="step-info">
                  <div className="step-label">Perform Unlearning</div>
                  <div className="step-desc">Purge poisoned influence, restore integrity</div>
                </div>
                <div className="step-status-dot"></div>
                <span className="step-number">03</span>
              </button>
            </div>
            <div className="divider" />
            <div className="legend">
              <div className="legend-item"><span style={{width:7,height:7,borderRadius:'50%',background:'#10b981',display:'inline-block'}}></span>Completed</div>
              <div className="legend-item"><span style={{width:7,height:7,borderRadius:'50%',background:'#f59e0b',display:'inline-block'}}></span>Running</div>
              <div className="legend-item"><span style={{width:7,height:7,borderRadius:'50%',background:'#f43f5e',display:'inline-block'}}></span>Failed</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">PDF Analysis</div>
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
              <div className="upload-icon">{file ? <PDFIcon /> : <UploadIcon />}</div>
              {file ? (
                <div>
                  <div className="upload-main" style={{color:'#a5b4fc'}}>PDF ready for analysis</div>
                  <div className="file-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>{file.name}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="upload-main">Drop PDF here or click to browse</div>
                  <div className="upload-sub">Accepts .pdf files only</div>
                </div>
              )}
            </div>
            <button
              className={`analyze-btn ${steps.predict === 'loading' ? 'running' : ''}`}
              onClick={handlePredict}
              disabled={!file || steps.predict === 'loading'}
            >
              {steps.predict === 'loading' ? (
                <>
                  <svg className="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Analyze PDF
                </>
              )}
            </button>
            {result && (
              <div className={`result-card ${isMalicious ? 'malicious' : 'benign'}`}>
                <div className="result-indicator">{isMalicious ? '⚠️' : '✅'}</div>
                <div>
                  <div className="result-label">Detection Result</div>
                  <div className="result-value">{result}</div>
                  <div className="result-sub">
                    {isMalicious
                      ? 'Suspicious patterns detected — handle with caution'
                      : 'No malicious patterns found — file appears safe'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <UnlearningDashboard pipelinePhase={pipelinePhase} />

        <div className="status-bar">
          <div className="status-dot"></div>
          {globalStatus || 'System ready — select a pipeline step or upload a PDF to begin'}
        </div>
      </div>
    </>
  );
}
const EXTENSION_URL =
  "https://marketplace.visualstudio.com/items?itemName=secondcortex-labs.secondcortex";

export default function BackendOffline({ title }: { title: string }) {
  return (
    <div className="query-result" style={{ maxWidth: "640px", width: "100%", margin: "0 auto" }}>
      <div className="result-label">Backend offline</div>
      <div className="result-text" style={{ fontSize: "28px", margin: "12px 0" }}>
        {title} is unavailable
      </div>
      <div className="result-text">
        The SecondCortex API is not deployed right now. Use the VS Code extension locally — it
        captures context on your machine with no cloud backend required.
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
        <a className="btn-primary" href={EXTENSION_URL} target="_blank" rel="noreferrer">
          Install Extension
        </a>
        <a className="btn-secondary" href="/offline-setup">
          Offline Setup
        </a>
        <a className="btn-secondary" href="/">
          Back to Home
        </a>
      </div>
    </div>
  );
}

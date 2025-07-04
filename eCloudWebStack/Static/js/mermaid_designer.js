import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  mermaid.initialize({ startOnLoad: false });

  const input = document.getElementById("mermaid-input");
  const preview = document.getElementById("mermaid-preview");

  function renderDiagram() {
    const code = input.value.trim();
    preview.innerHTML = "";

    const temp = document.createElement("div");
    temp.className = "mermaid";
    temp.textContent = code;  // ✅ use textContent to avoid <br> issues
    preview.appendChild(temp);

    try {
      mermaid.run({ nodes: [temp] });
    } catch (err) {
      preview.innerHTML = `<div class="text-red-500">❌ Error: ${err.message}</div>`;
    }
  }

input.addEventListener("input", renderDiagram);
window.addEventListener("load", renderDiagram);


  document.getElementById("download-svg").addEventListener("click", () => {
  const svg = document.querySelector("#mermaid-preview svg");
  if (!svg) {
    alert("Diagram not rendered yet!");
    return;
  }

  // Serialize SVG content
  const serializer = new XMLSerializer();
  const svgBlob = new Blob([serializer.serializeToString(svg)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  // Trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = "mermaid-diagram.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});


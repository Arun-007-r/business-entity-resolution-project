const $ = (id) => document.getElementById(id);

["1", "2", "3"].forEach((n) => {
  $("f" + n).addEventListener("change", () => {
    $("n" + n).textContent = $("f" + n).files[0]?.name || "No file selected";
  });
});

$("run").addEventListener("click", async () => {
  const err = $("error");
  err.classList.add("hidden");
  $("results").classList.add("hidden");

  if (!["1", "2", "3"].every((n) => $("f" + n).files.length)) {
    err.textContent = "Please upload all three TSV files.";
    err.classList.remove("hidden");
    return;
  }

  const fd = new FormData();
  ["1", "2", "3"].forEach((n) => fd.append("source" + n, $("f" + n).files[0]));

  $("run").disabled = true;
  $("loading").classList.remove("hidden");

  try {
    const response = await fetch("/api/match", { method: "POST", body: fd });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Prediction failed.");
    }

    $("s1").textContent = data.source1_records;
    $("s2").textContent = data.source2_records;
    $("s3").textContent = data.source3_records;
    $("m").textContent = data.total_matches;
    $("threshold").textContent = Number(data.threshold).toFixed(2);

    $("s1-summary").textContent = data.source1_records;
    $("s2-summary").textContent = data.source2_records;
    $("s3-summary").textContent = data.source3_records;
    $("m-summary").textContent = data.total_matches;

    $("body").innerHTML = (data.preview || [])
      .map(
        (x) =>
          `<tr><td>${escapeHtml(x.source1_entity_id)}</td><td>${escapeHtml(
            x.matched_entity_ids || "No match"
          )}</td></tr>`
      )
      .join("");

    $("results").classList.remove("hidden");
  } catch (error) {
    err.textContent = error.message;
    err.classList.remove("hidden");
  } finally {
    $("run").disabled = false;
    $("loading").classList.add("hidden");
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

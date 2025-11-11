const buyButtons = document.querySelectorAll(".buy-btn");

buyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedMovie = btn.dataset.movie;
    localStorage.setItem("selectedMovie", selectedMovie);
    window.location.href = "checkout.html";
  });
});

if (window.location.pathname.includes("checkout.html")) {
  const movieTitleEl = document.getElementById("movie-title");
  const movieName = localStorage.getItem("selectedMovie");
  if (movieName) movieTitleEl.textContent = movieName;

  const seatsContainer = document.getElementById("seats");
  if (seatsContainer) {
    const rows = 5;
    const cols = 8;
    for (let i = 0; i < rows * cols; i++) {
      const seat = document.createElement("div");
      seat.classList.add("seat");
      if (Math.random() < 0.1) seat.classList.add("occupied");
      seatsContainer.appendChild(seat);
    }

    seatsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("seat") && !e.target.classList.contains("occupied")) {
        e.target.classList.toggle("selected");
        updateSummary();
      }
    });
  }

  const cpfInput = document.getElementById("cpf");
  if (cpfInput) {
    cpfInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = value;
    });
  }

  document.querySelectorAll(".snack").forEach(cb => cb.addEventListener("change", updateSummary));
  document.getElementById("showtime").addEventListener("change", updateSummary);
  document.getElementById("session-type").addEventListener("change", updateSummary);
  document.querySelectorAll("input[name='payment']").forEach(r => r.addEventListener("change", updateSummary));

  const finalizarBtn = document.getElementById("finalizar-btn");
  finalizarBtn.addEventListener("click", () => {
    const selectedSeats = document.querySelectorAll(".seat.selected");
    const selectedSnacks = document.querySelectorAll(".snack:checked");
    const showtime = document.getElementById("showtime").value;
    const sessionType = document.getElementById("session-type").value;
    const email = document.getElementById("email").value;
    const name = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const payment = document.querySelector('input[name="payment"]:checked')?.value;

    if (!name || !cpf || !showtime || !sessionType || !email || !payment || selectedSeats.length === 0) {
      alert("⚠️ Por favor, preencha todos os campos e selecione um método de pagamento.");
      return;
    }

    const snackNames = [...selectedSnacks].map(s => s.value).join(", ") || "Nenhum";
    let seatPrice = sessionType === "3D" ? 35 : sessionType === "IMAX" ? 45 : 25;
    const seatTotal = selectedSeats.length * seatPrice;
    const snackTotal = [...selectedSnacks].reduce((sum, s) => sum + parseFloat(s.dataset.price), 0);
    const total = seatTotal + snackTotal;

    const modal = document.createElement("div");
    modal.innerHTML = `
      <div id="confirm-modal" style="
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
      ">
        <div style="
          background: #fff;
          color: #333;
          padding: 25px;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
          animation: fadeIn 0.3s ease;
        ">
          <h2 style="margin-bottom: 15px;">Confirme sua compra</h2>
          <p><b>Filme:</b> ${movieName}</p>
          <p><b>Sessão:</b> ${sessionType}</p>
          <p><b>Horário:</b> ${showtime}</p>
          <p><b>Assentos:</b> ${selectedSeats.length}</p>
          <p><b>Lanches:</b> ${snackNames}</p>
          <p><b>Forma de Pagamento:</b> ${payment}</p>
          <p style="margin-top:10px; font-weight:bold; font-size:1.2em;">
            Total: R$ ${total.toFixed(2).replace('.', ',')}
          </p>

          <div style="margin-top:20px; display:flex; justify-content:space-around;">
            <button id="cancelar" style="
              background:#ccc; border:none; padding:10px 20px;
              border-radius:8px; cursor:pointer;">Cancelar</button>
            <button id="confirmar" style="
              background:#28a745; border:none; color:white;
              padding:10px 20px; border-radius:8px; cursor:pointer;">Confirmar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("cancelar").addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirmar").addEventListener("click", () => {
      modal.remove();
      alert(`✅ Compra confirmada!
Filme: ${movieName}
Sessão: ${sessionType}
Horário: ${showtime}
Assentos: ${selectedSeats.length}
Lanches: ${snackNames}
Forma de Pagamento: ${payment}
Confirmação enviada para: ${email}`);
      localStorage.clear();
      window.location.href = "index.html";
    });
  });

  function updateSummary() {
    const selectedSeats = document.querySelectorAll(".seat.selected");
    const selectedSnacks = document.querySelectorAll(".snack:checked");
    const showtime = document.getElementById("showtime").value || "—";
    const sessionType = document.getElementById("session-type").value || "—";
    const payment = document.querySelector('input[name="payment"]:checked')?.value || "—";

    let seatPrice = 0;
    if (sessionType === "2D") seatPrice = 25;
    else if (sessionType === "3D") seatPrice = 35;
    else if (sessionType === "IMAX") seatPrice = 45;

    const seatTotal = selectedSeats.length * seatPrice;
    const snackTotal = [...selectedSnacks].reduce(
      (sum, s) => sum + parseFloat(s.dataset.price),
      0
    );
    const total = seatTotal + snackTotal;

    const summary = document.getElementById("summary-content");
    summary.innerHTML = `
      <b>Filme:</b> ${movieName}<br>
      <b>Tipo de Sessão:</b> ${sessionType} ${seatPrice ? `(R$ ${seatPrice},00 por assento)` : ""}<br>
      <b>Horário:</b> ${showtime}<br>
      <b>Assentos:</b> ${selectedSeats.length > 0 ? selectedSeats.length : "Nenhum"}<br>
      <b>Lanches:</b> ${selectedSnacks.length > 0 ? [...selectedSnacks].map(s => s.value).join(", ") : "Nenhum"}<br>
      <b>Forma de Pagamento:</b> ${payment}<br>
      <hr style="border: none; border-top: 1px solid #444; margin: 10px 0;">
      <b>Total Assentos:</b> R$ ${seatTotal.toFixed(2).replace('.', ',')}<br>
      <b>Total Lanches:</b> R$ ${snackTotal.toFixed(2).replace('.', ',')}<br>
      <div style="margin-top: 10px; font-size: 1.2rem; color: #ff4b2b; font-weight: bold;">
        Total Geral: R$ ${total.toFixed(2).replace('.', ',')}
      </div>
    `;
  }
}


var idUsuarioTela = "-O7PsdGxpfK5_bcSIP3l";
var urlApi = "https://users-manager-tau.vercel.app/";
var valor = 190;
var pix = "123456";

$(document).ready(function () {
  $("#objeto").mask("000.000.000-00");
  $("#mainContent").hide();
  $("#inputToCpf").show();

  fetch(urlApi + "usuario/" + idUsuarioTela, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      valor = data.valor;
      pix = data.chavepix;
    })
    .catch((error) => {
      console.error("Erro na requisição:", error);
    });
});

var qrcodetext = "";

function gerarPagamento() {
  var data = {
    version: "01",
    key: pix,
    city: "Sao Paulo",
    name: "João Silva",
    value: valor,
    transactionId: "1234",
    message: "Pagamento de Teste",
    cep: "75690000",
    currency: 986,
    countryCode: "BR",
  };

  fetch("https://gerador-pix-qrcode.vercel.app/pix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      qrcodetext = data;
      console.log(data);
      $("#pixCopia").text(qrcodetext.payload);
      $("#qrcode").html("");
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: qrcodetext,
        width: 244, // Largura do QR Code
        height: 244, // Altura do QR Code
      });
      $("#valorTaxa").text("R$ " + valor.toFixed(2).replace(".", ","));
      $(".payment").show();
      $(".payment").addClass("paymentClass");
      atualizarCount();
    })
    .catch((error) => {
      console.error("Erro na requisição:", error);
    });
}

function copiarToClip() {
  event.preventDefault();
  $("#msgPix").hide();
  navigator.clipboard.writeText(qrcodetext.payload).then(() => {
    $("#msgPix").show();
    setTimeout(() => {
      $("#msgPix").hide();
    }, 3000);
  });
}

function validarCpf() {
  const apiUrl = "https://api.cpfcnpj.com.br/"; 
  let cpf = $("#objeto").val();

  if (!cpf) {
    alert("Por favor, insira um CPF válido.");
    console.error("CPF não informado!");
    return;
  }

  // Remove pontos e traços do CPF
  cpf = cpf.replace(/[^\d]/g, "");
  console.log("CPF formatado sem pontuação:", cpf);

  const url = apiUrl + cpf + "/json";
  console.log("URL gerada:", url);

  fetch(url, { method: "GET" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Resposta recebida da API:", data);

      if (data.status === 200 && data.nome) {
        // Exibir conteúdo principal
        $("#mainContent").show();
        $("#inputToCpf").hide();
        $("#greeting").text("Olá, " + data.nome);
      } else {
        console.error("CPF não encontrado:", data);
        alert("CPF não encontrado ou inválido.");
      }
    })
    .catch((error) => {
      console.error("Erro ao validar CPF:", error);
      alert("Ocorreu um erro ao validar o CPF. Por favor, tente novamente.");
    });
}

function atualizarCount() {
  fetch(urlApi + "usuario/" + idUsuarioTela + "/gerado", {
    method: "PUT",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Contagem atualizada com sucesso:", data);
    })
    .catch((error) => {
      console.error("Erro na atualização de contagem:", error);
    });
}

const API_URL = "http://localhost:5050";
let projetosEncontrados = {};
let passwordView = "";
let passwordAction = "";

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("dark-mode");
  fetchProjects("POST", "api")
    .then((response) => response.json())
    .then((data) => {
      projetosEncontrados = data;
      const lastKey = Object.keys(projetosEncontrados.projects).pop();
      const lastValue = projetosEncontrados.projects[lastKey];
      return (proxId = String(lastValue.id + 1));
    })
    .catch((error) => console.error("Erro ao buscar projetos:", error));
});

function toggleDarkMode() {
  document.body.classList.toggle("light-mode");
}

function password() {
  if (passwordView === "") {
    const password = prompt("Digite a senha para acessar os projetos:");
    if (!password) {
      return alert("Senha é obrigatória!");
    } else {
      passwordView = password;
      return password;
    }
  } else {
    return passwordView;
  }
}

function passwordPost() {
  if (passwordAction === "") {
    const password = prompt("Digite a senha para acessar os projetos:");
    if (!password) {
      return alert("Senha é obrigatória!");
    } else {
      passwordAction = password;
      return password;
    }
  } else {
    return passwordAction;
  }
}

function fetchProjects(method, url, bodyConfig) {
  return fetch(`${API_URL}/${url}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "x-api-password": password(),
    },
    body: bodyConfig ? JSON.stringify(bodyConfig) : "",
  });
}

function hideProjects() {
  document.getElementById("loadingProjects").style.display = "block";
  document.getElementById("hideProjects").style.display = "none";
  document.getElementById("projectsList").innerHTML = "";
}

function getProjects() {
  document.getElementById("loadingProjects").style.display = "none";
  document.getElementById("hideProjects").style.display = "block";
  fetchProjects("POST", "api")
    .then((response) => response.json())
    .then((data) => {
      const projectsList = document.getElementById("projectsList");
      projectsList.innerHTML = "";
      projetosEncontrados = data;
      data.projects.forEach((project) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${project.id}</strong> - ${project.title} 
            </div>
            <div>
                <button onclick="editProject(${project.id})">Editar</button>
                <button onclick="deleteProject(${project.id})">Excluir</button>
            </div>
        `;
        projectsList.appendChild(li);
      });
    })
    .catch((error) => console.error("Erro ao buscar projetos:", error));
}

function editProject(id) {

  document.getElementById("showForm").style.display = "none";
  document.getElementById("hideForm").style.display = "block";

  const postPassword = passwordPost();
  if (!postPassword) return null;

  const project = projetosEncontrados.projects.find((p) => p.id === id);
  if (!project) {
    alert("Projeto não encontrado!");
    return;
  }

  document.getElementById("contentForm").innerHTML = `
    <form id="editProjectForm">
      <input type="text" id="id" value="${project.id}" disabled />
      <input type="text" id="title" value="${project.title}" required />
      <input type="text" id="shortDescription" value="${
        project.shortDescription || ""
      }" />
      <textarea id="description" required>${
        project.description || ""
      }</textarea>
      <input type="text" id="website" value="${project.website || ""}" />
      <input type="text" id="github" value="${project.github || ""}" />
      <input type="text" id="image" value="${project.image || ""}" />
      <input type="text" id="tec" value="${
        project.tec ? project.tec.join(", ") : ""
      }" />
      <input type="text" id="duration" value="${project.duration || ""}" />
      <label>
        Destaque:
        <input type="checkbox" id="featured" ${
          project.featured ? "checked" : ""
        } />
      </label>
      <button type="submit">Atualizar Projeto</button>
    </form>
    <br>
  `;

  document
    .getElementById("editProjectForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const updatedProject = {
        id: project.id,
        title: document.getElementById("title").value,
        shortDescription: document.getElementById("shortDescription").value,
        description: document.getElementById("description").value,
        website: document.getElementById("website").value,
        github: document.getElementById("github").value,
        image: document.getElementById("image").value,
        tec: document.getElementById("tec").value.split(",").map(Number),
        duration: document.getElementById("duration").value,
        featured: document.getElementById("featured").checked,
        postPassword,
      };

      fetchProjects("PUT", "api-edit", updatedProject)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao atualizar projeto");
          }
          return response.json();
        })
        .then((data) => {
          alert(data.message);
          getProjects();
        })
        .catch((error) => console.error("Erro ao atualizar projeto:", error));
      fecharFormulario();
    });
}

function deleteProject(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este projeto?");
  if (!confirmDelete) return;

  fetch(`${API_URL}/api-delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-api-password": password(),
    },
    body: JSON.stringify({ id }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      getProjects();
    })
    .catch((error) => console.error("Erro ao excluir projeto:", error));
}

function openForm() {
  document.getElementById("showForm").style.display = "none";
  document.getElementById("hideForm").style.display = "block";

  document.getElementById("contentForm").innerHTML = `
    <form id="addProjectForm">
      <input type="text" id="id" placeholder="id (${proxId})" required />
      <input type="text" id="title" placeholder="Título" required />
      <input type="text" id="shortDescription" placeholder="Descrição Curta" />
      <textarea id="description" placeholder="Descrição Completa" required></textarea>
      <input type="text" id="website" placeholder="Website" />
      <input type="text" id="github" placeholder="GitHub" />
      <input type="text" id="image" placeholder="URL da Imagem" />
      <input type="text" id="tec" placeholder="Tecnologias (IDs separados por vírgula)" />
      <input type="text" id="duration" placeholder="Duração (ex: 24/02/2024 - 06/08/2024)" />
      <label>
        Destaque:
        <input type="checkbox" id="featured" />
      </label>
      <button type="submit">Adicionar Projeto</button>
    </form>
    <br>
  `;

  document
    .getElementById("addProjectForm")
    .addEventListener("submit", submitForm);
}

function closeForm() {
  document.getElementById("hideForm").style.display = "none";
  document.getElementById("showForm").style.display = "block";
  document.getElementById("contentForm").innerHTML = "";
}

function submitForm(event) {
  event.preventDefault();

  const postPassword = String(prompt("Digite a senha para postar o projeto:"));
  if (!postPassword) return alert("Senha é obrigatória!");

  const id = Number(document.getElementById("id").value);
  const title = document.getElementById("title").value;
  const shortDescription = document.getElementById("shortDescription").value;
  const description = document.getElementById("description").value;
  const website = document.getElementById("website").value;
  const github = document.getElementById("github").value;
  const image = document.getElementById("image").value;
  const tec = document.getElementById("tec").value.split(",").map(Number);
  const duration = document.getElementById("duration").value;
  const featured = document.getElementById("featured").checked;

  fetchProjects("POST", "api-post", {
    id,
    title,
    shortDescription,
    description,
    website,
    github,
    image,
    tec,
    duration,
    featured,
    postPassword,
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      getProjects();
    })
    .catch((error) => console.error("Erro ao adicionar projeto:", error));
  fecharFormulario();
}

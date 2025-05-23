import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

import { db } from "./firebase.js";
import { auth } from "./firebase.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const showFormBtn = document.getElementById("showForm");
  const hideFormBtn = document.getElementById("hideForm");
  const login = document.getElementById("authSection");
  const quit = document.getElementById("quitLogin");

  if (user) {
    console.log("Usuário autenticado:", user.email);
    showFormBtn.style.display = "inline-block";
    hideFormBtn.style.display = "inline-block";
    quit.style.display = "inline-block";
    login.style.display = "none";
  } else {
    quit.style.display = "none";
    showFormBtn.style.display = "none";
    hideFormBtn.style.display = "none";
    closeForm();
  }
});

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Logado como:", userCredential.user.email);
  } catch (err) {
    alert("Erro ao logar: " + err.message);
  }
};

window.logout = async function () {
  await signOut(auth);
  alert("Você saiu.");
};

window.openForm = function (projeto = null) {
  const project = projeto || {
    title: "",
    shortDescription: "",
    description: "",
    website: "",
    github: "",
    image: "",
    tec: "",
    duration: "",
    featured: false,
  };

  document.getElementById("contentForm").innerHTML = `
    <form id="editProjectForm">
      <div id="alerts"></div>
      <input type="text" id="title" placeholder="Título" value="${
        project.title
      }" required />
      <input type="text" id="shortDescription" placeholder="Descrição Curta" value="${
        project.shortDescription || ""
      }" />
      <textarea id="description" placeholder="Descrição Completa" required>${
        project.description || ""
      }</textarea>
      <input type="text" id="website" placeholder="Link do Site" value="${
        project.website || ""
      }" />
      <input type="text" id="github" placeholder="Link do GitHub" value="${
        project.github || ""
      }" />
      <input type="text" id="image" placeholder="URL da Imagem" value="${
        project.image || ""
      }" />
      <input type="text" id="tec" placeholder="Tecnologias (separadas por vírgula)" value="${
        project.tec ? project.tec.join(", ") : ""
      }" />
      <input type="text" id="duration" placeholder="Duração" value="${
        project.duration || ""
      }" />
      <label>
        Destaque:
        <input type="checkbox" id="featured" ${
          project.featured ? "checked" : ""
        } />
      </label>
      <button type="submit">${
        project.id ? "Atualizar" : "Salvar"
      } Projeto</button>
    </form>
  `;

  document
    .getElementById("editProjectForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      document.getElementById("alerts").innerHTML = "carregando...";
      const title = document.getElementById("title").value;
      const shortDescription =
        document.getElementById("shortDescription").value;
      const description = document.getElementById("description").value;
      const website = document.getElementById("website").value;
      const github = document.getElementById("github").value;
      const image = document.getElementById("image").value;
      const tec = document
        .getElementById("tec")
        .value.split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const duration = document.getElementById("duration").value;
      const featured = document.getElementById("featured").checked;

      const data = {
        title,
        shortDescription,
        description,
        website,
        github,
        image,
        tec,
        duration,
        featured,
      };

      if (project.id) {
        // EDITAR
        const ref = doc(db, "projetos", project.id);
        await updateDoc(ref, data);
        document.getElementById("alerts").innerHTML = "editado :)";
      } else {
        // CRIAR NOVO
        await addDoc(collection(db, "projetos"), data);
        document.getElementById("alerts").innerHTML = "enviado :)";
      }

      closeForm();
      getProjects();
    });
};

window.closeForm = function () {
  document.getElementById("contentForm").innerHTML = "";
};

window.getProjects = async function () {
  const querySnapshot = await getDocs(collection(db, "projetos"));
  const lista = document.getElementById("projectsList");
  lista.innerHTML = "";

  querySnapshot.forEach((docItem) => {
    const data = docItem.data();
    const li = document.createElement("li");
    li.innerHTML = `
  <strong>${data.title}</strong> - ${data.shortDescription || ""}
  ${
    currentUser
      ? ` 
        <div class="actions">
          <button onclick="editProject('${docItem.id}')">Editar</button>
          <button onclick="deleteProject('${docItem.id}')">Excluir</button>
        </div>
         `
      : ""
  }
`;
    lista.appendChild(li);
  });
};

window.editProject = async function (id) {
  const ref = doc(db, "projetos", id);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    openForm({ id, ...snapshot.data() });
  }
};

window.deleteProject = async function (id) {
  await deleteDoc(doc(db, "projetos", id));
  getProjects();
};

window.hideProjects = function () {
  document.getElementById("projectsList").innerHTML = "";
};

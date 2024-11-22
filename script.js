const overlay = document.createElement("div");
overlay.id = "start-overlay";
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
document.body.style.overflow = "hidden";
overlay.style.background = "linear-gradient(0deg,#dbdad9,#ffffff)";
overlay.style.zIndex = "1000";
overlay.style.display = "flex";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.cursor = "none";
overlay.style.transition = "opacity 0.5s ease";
document.body.appendChild(overlay);
document.body.style.overflow = "hidden";

const trackingTextContainer = document.createElement("div");
trackingTextContainer.style.position = "absolute";
trackingTextContainer.style.width = "150px";
trackingTextContainer.style.height = "150px";
trackingTextContainer.style.borderRadius = "50%";
trackingTextContainer.style.border = "1px solid black";
trackingTextContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
trackingTextContainer.style.display = "flex";
trackingTextContainer.style.justifyContent = "center";
trackingTextContainer.style.alignItems = "center";
trackingTextContainer.style.textAlign = "center";
trackingTextContainer.style.fontFamily = "Arial, sans-serif";
trackingTextContainer.style.fontSize = "1rem";
trackingTextContainer.style.color = "#000";
trackingTextContainer.style.pointerEvents = "none";
trackingTextContainer.style.transform = "translate(-50%, -50%)";
overlay.appendChild(trackingTextContainer);

const trackingText = document.createElement("div");
trackingText.innerText = "Click to Start Your Journey";
trackingTextContainer.appendChild(trackingText);

document.addEventListener("mousemove", (event) => {
  trackingTextContainer.style.left = `${event.clientX}px`;
  trackingTextContainer.style.top = `${event.clientY}px`;
});

const receipt = document.querySelector(".receipt");

overlay.addEventListener("click", () => {
  overlay.style.opacity = "0";
  setTimeout(() => {
    overlay.remove();
    animateReceipt();
  }, 500);
});

function animateReceipt() {
  if (receipt) {
    receipt.style.transition = "top 1s ease, opacity 1s ease";
    receipt.style.top = "87%";
    receipt.style.opacity = "1";
    scanSound.play();
  }
}

const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xfefdfd);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 5);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setClearColor(0xfffff, 1);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.tonMapping = THREE.ACESFilmicToneMapping;
renderer.tonMappingExposure = 2.5;
document.querySelector(".modal").appendChild(renderer.domElement);

function basicAnimate() {
  renderer.render(scene, camera);
  requestAnimationFrame(basicAnimate);
}
basicAnimate();

let model;

const loader = new THREE.GLTFLoader();

loader.load("./assets/josta.glb", function (gltf) {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        node.material.metalness = 0.3;
        node.material.roughness = 0.4;
        node.material.envMapIntensity = 1.5;
      }
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += 10;

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 1.5;

  model.scale.set(0, 0, 0);
  scene.add(model);
  animate();
  playInitialAnimation();
  cancelAnimationFrame(basicAnimate);
});

const floatAmplitude = 0.2;

const floatSpeed = 1.5;
const rotationSpeed = 0.3;
let isFloating = true;
let currentScroll = 0;

const stickyHeight = window.innerHeight;

const scannerSection = document.querySelector(".scanner");
const scannerPosition = scannerSection.offsetTop;
const scanContainer = document.querySelector("scan-container");
const scanSound = new Audio("./assets/print.mp3");
const beepSound = new Audio("./assets/beep.mp3");
const insidePurchased = document.getElementById("insidePurchased");
const scanlight = document.getElementById("scanlight");
insidePurchased.textContent = "Buy";
gsap.set(scanContainer, { scale: 0 });

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
    });
  }
  gsap.to(scanContainer, {
    scale: 1,
    duration: 1,
    ease: "power2.out",
  });
}

ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "top -10",
  onEnterBack: () => {
    if (model) {
      gsap.to(model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: "power2.out",
      });
      isFloating = true;
    }
    gsap.to(scanContainer, {
      scale: 1,
      duration: 1,
      ease: "power2.out",
    });
  },
});

ScrollTrigger.create({
  trigger: ".scanner",
  start: "top top",
  end: `${stickyHeight}px `,
  pin: true,
  onEnter: () => {
    isFloating = false;
    model.position.y = 0;

    setTimeout(() => {
      beepSound.currentTime = 0;
      scanlight.style.display = "block";
      scanlight.style.top = "100%";
      scanlight.style.transition = "top 1s ease";
      beepSound.play();
    }, 500);

    setTimeout(() => {
      scanSound.currentTime = 0;
      scanSound.play();
      receipt.style.top = "70%";
      scanlight.style.display = "none";
      scanlight.style.top = "0";
    }, 1000);

    gsap.to(model.rotation, {
      y: model.rotation.y + Math.PI * 2,
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(model.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            gsap.to(scanContainer, {
              scale: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                // Change text to "Purchased" after scan
                insidePurchased.textContent = "Purchased";
              },
            });
          },
        });
      },
    });
  },
  onLeaveBack: () => {
    gsap.set(scanContainer, { scale: 0 });
    gsap.to(scanContainer, {
      scale: 1,
      duration: 1,
      ease: "power2.out",
    });
  },
});

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

function animate() {
  if (model) {
    if (isFloating) {
      const floatOffset =
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = floatOffset;
    }

    const scrollProgress = Math.min(currentScroll / scannerPosition, 1);

    if (scrollProgress < 1) {
      model.rotation.x = scrollProgress * Math.PI * 2;
    }

    if (scrollProgress < 1) {
      model.rotation.y += 0.001 * rotationSpeed;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 3);
mainLight.position.set(5, 10, 7.5);

scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.position.set(0, 25, 0);
scene.add(hemiLight);

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

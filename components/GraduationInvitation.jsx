"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import {
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  ArrowLeft,
  Star,
  Thermometer,
  Navigation,
  X,
  Bolt,
  Settings,
} from "lucide-react";
import Image from "next/image";

// --- HOOK PERSONALIZADO PARA O TEMA DINÂMICO ---
// Esta é a principal melhoria. Ele calcula as cores suavemente.
const useDynamicTheme = (temperature) => {
  const [themeColors, setThemeColors] = useState({
    "--color-bg-from": "hsl(221, 39%, 11%)", // Cor inicial do gradiente (azul escuro)
    "--color-bg-via": "hsl(240, 50%, 15%)",
    "--color-bg-to": "hsl(250, 50%, 20%)",
    "--color-primary": "hsl(210, 90%, 60%)", // Cor primária (azul)
    "--color-secondary": "hsl(210, 70%, 80%)",
    "--color-accent": "hsl(210, 90%, 60%)",
    "--shadow-color": "hsla(210, 90%, 60%, 0.25)",
    "--button-bg": "hsl(220, 80%, 55%)",
    "--button-hover": "hsl(220, 80%, 65%)",
  });
  useEffect(() => {
    const temp = Math.min(100, Math.max(0, temperature));

    // Definimos nossos "pontos de parada" de cor em HSL
    const stops = {
      primary: [
        { t: 0, h: 210, s: 90, l: 60 }, // Azul
        { t: 25, h: 260, s: 90, l: 65 }, // Roxo
        { t: 50, h: 320, s: 90, l: 65 }, // Rosa
        { t: 75, h: 5, s: 90, l: 60 }, // Vermelho
        { t: 100, h: 30, s: 95, l: 55 }, // Laranja
      ],
      background: [
        { t: 0, h: 221, s: 39, l: 11 }, // Azul escuro
        { t: 25, h: 270, s: 50, l: 10 }, // Roxo escuro
        { t: 50, h: 330, s: 50, l: 10 }, // Rosa escuro
        { t: 75, h: 0, s: 60, l: 10 }, // Vermelho escuro
        { t: 100, h: 20, s: 70, l: 10 }, // Laranja escuro
      ],
    };

    // Função para interpolar (calcular a cor intermediária)
    const interpolate = (colorStops) => {
      const lowerStop =
        colorStops.filter((s) => s.t <= temp).pop() || colorStops[0];
      const upperStop =
        colorStops.filter((s) => s.t > temp)[0] ||
        colorStops[colorStops.length - 1];

      if (lowerStop === upperStop) {
        return { h: lowerStop.h, s: lowerStop.s, l: lowerStop.l };
      }

      const progress = (temp - lowerStop.t) / (upperStop.t - lowerStop.t);

      // Trata o Hue (matiz) como um círculo para transições suaves (ex: de 350° para 10°)
      let h1 = lowerStop.h;
      let h2 = upperStop.h;
      if (Math.abs(h2 - h1) > 180) {
        if (h2 > h1) h1 += 360;
        else h2 += 360;
      }

      const h = (h1 + (h2 - h1) * progress) % 360;
      const s = lowerStop.s + (upperStop.s - lowerStop.s) * progress;
      const l = lowerStop.l + (upperStop.l - lowerStop.l) * progress;

      return { h, s, l };
    };

    const primary = interpolate(stops.primary);
    const bg = interpolate(stops.background);

    setThemeColors({
      "--color-bg-from": `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`,
      "--color-bg-via": `hsl(${bg.h + 20}, ${bg.s}%, ${bg.l + 4}%)`,
      "--color-bg-to": `hsl(${bg.h + 40}, ${bg.s}%, ${bg.l + 8}%)`,
      "--color-primary": `hsl(${primary.h}, ${primary.s}%, ${primary.l}%)`,
      "--color-secondary": `hsl(${primary.h}, ${primary.s - 20}%, ${
        primary.l + 20
      }%)`,
      "--color-accent": `hsl(${primary.h}, ${primary.s}%, ${primary.l}%)`,
      "--shadow-color": `hsla(${primary.h}, ${primary.s}%, ${primary.l}%, 0.25)`,
      "--button-bg": `hsl(${primary.h}, ${primary.s - 10}%, ${primary.l - 5}%)`,
      "--button-hover": `hsl(${primary.h}, ${primary.s - 10}%, ${primary.l}%)`,
    });
  }, [temperature]);

  return themeColors;
};

export default function GraduationInvitation() {
  const [currentStep, setCurrentStep] = useState("welcome"); // welcome, heating, details, rsvp
  const [rsvpData, setRsvpData] = useState({ name: "", phone: "", guests: 1 });
  const [rsvpStatus, setRsvpStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [temperature, setTemperature] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const particlesRef = useRef(null);
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwgqAWkjj1Qbh9-PXovckv68X39krHwUdsOMV4gYVfXI0U6-pdoyl2E7W1aWNPOgKlg/exec";

  // --- USANDO O HOOK DE TEMA DINÂMICO ---
  const theme = useDynamicTheme(
    currentStep === "heating" || currentStep === "welcome" ? temperature : 100
  );

  // Garantir hidratação correta no Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animação de aquecimento mais suave e lenta
  // Animação de aquecimento mais suave e eficiente
  useEffect(() => {
    if (currentStep !== "heating" || !isClient) {
      return;
    }

    let animationFrameId;
    const startTime = performance.now();
    const duration = 5000; // 5 segundos, igual ao anterior

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setTemperature(progress * 100);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Atingiu 100%, aguarda 1 segundo para ir para os detalhes
        setTimeout(() => {
          setCurrentStep("details");
        }, 1000);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStep, isClient]);

  // Criar partículas quando aquecido
  // useEffect(() => {
  //   if (currentStep === "details" && particlesRef.current && isClient) {
  //     const container = particlesRef.current;
  //     container.innerHTML = "";

  //     for (let i = 0; i < 60; i++) {
  //       const particle = document.createElement("div");
  //       particle.className = "absolute w-1 h-1 rounded-full animate-pulse";
  //       particle.style.left = Math.random() * 100 + "%";

  //       const colors = ["#f97316", "#ef4444", "#ec4899", "#d946ef", "#8b5cf6"];
  //       particle.style.backgroundColor =
  //         colors[Math.floor(Math.random() * colors.length)];

  //       particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
  //       particle.style.animationDelay = Math.random() * 4 + "s";
  //       particle.style.filter = "blur(0.5px)";
  //       particle.style.boxShadow = `0 0 4px ${particle.style.backgroundColor}`;
  //       particle.style.animation = `heatRise ${
  //         Math.random() * 3 + 2
  //       }s linear infinite`;
  //       container.appendChild(particle);
  //     }
  //   }
  // }, [currentStep, isClient]);

  // Iniciar aquecimento
  const handleStartHeating = () => {
    setCurrentStep("heating");
  };

  // Voltar para a tela de boas-vindas e resetar estado
  const handleGoBack = useCallback(() => {
    setCurrentStep("welcome");
    setTemperature(0);
    setRsvpData({ name: "", phone: "", guests: 1 });
    setErrors({});
    setRsvpStatus("idle");
    setShowRsvpModal(false);
  }, []);

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    if (!rsvpData.name.trim()) newErrors.name = "Nome é obrigatório";

    const phoneNumbers = rsvpData.phone.replace(/\D/g, "");
    if (!phoneNumbers) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!/^\d{10,11}$/.test(phoneNumbers)) {
      newErrors.phone = "Telefone inválido (deve ter 10 ou 11 dígitos)";
    }

    if (rsvpData.guests < 1 || rsvpData.guests > 5)
      newErrors.guests = "Entre 1 e 5 acompanhantes";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Formatar telefone enquanto digita
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

  // Enviar RSVP
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqabqwnq";

  const handleRSVP = async () => {
    if (!validateForm()) return;
    setRsvpStatus("loading");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: `✅ Nova Confirmação - ${rsvpData.name}`, // Assunto do email
          nome: rsvpData.name,
          telefone: rsvpData.phone,
          convidados: rsvpData.guests,
          data_confirmacao: new Date().toLocaleString("pt-BR"),
          evento: "Formatura Kieran Rocha 🎓",
          // Formspree vai enviar um email bonitinho para você com esses dados
        }),
      });

      if (response.ok) {
        console.log("✅ Confirmação enviada com sucesso!");
        setRsvpStatus("success");
        setShowRsvpModal(false);
        setTimeout(() => setCurrentStep("rsvp"), 1000);
      } else {
        throw new Error("Erro no envio");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      setRsvpStatus("error");
    }
  };
  // Prevenção de hidratação mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-pulse">Carregando convite...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        // --- ADICIONANDO TRANSIÇÕES GLOBAIS ---
        :root {
          /* As variáveis são definidas no style do div principal */
          transition: color 0.3s ease, background-color 0.3s ease,
            border-color 0.3s ease;
        }

        @keyframes heatRise {
          from {
            transform: translateY(100vh) scale(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
            transform: translateY(90vh) scale(1) rotate(90deg);
          }
          90% {
            opacity: 0.4;
            transform: translateY(10vh) scale(0.5) rotate(270deg);
          }
          to {
            transform: translateY(-100px) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 0 20px var(--shadow-color);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px var(--shadow-color);
            transform: scale(1.05);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }
        .temperature-progress {
          background: linear-gradient(
            to right,
            #3b82f6 0%,
            #8b5cf6 25%,
            #ec4899 50%,
            #ef4444 75%,
            #f97316 100%
          );
          transition: width 0.1s linear;
        }
      `}</style>

      {/* --- APLICANDO AS VARIÁVEIS DE COR NO CONTAINER PRINCIPAL --- */}
      <div
        className="min-h-screen bg-gradient-to-br from-[var(--color-bg-from)] via-[var(--color-bg-via)] to-[var(--color-bg-to)] transition-all duration-500 ease-linear relative overflow-hidden font-sans"
        style={theme}
      >
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white/50 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-white/50 rounded-full animate-pulse"></div>
        </div>

        {currentStep === "details" && (
          <div
            ref={particlesRef}
            className="absolute inset-0 z-10 pointer-events-none"
          ></div>
        )}

        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {currentStep === "details" && (
              <button
                onClick={handleGoBack}
                className="absolute top-8 left-8 flex items-center text-white/70 hover:text-white transition-colors group z-30"
              >
                <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                Voltar ao Início
              </button>
            )}

            {/* --- TELA DE BOAS-VINDAS (ATUALIZADA COM VARIÁVEIS) --- */}
            {currentStep === "welcome" && (
              <div className="text-center animate-fade-in-up">
                <div className="space-y-8">
                  <div className="relative w-72 h-72 mx-auto mb-8 flex items-center justify-center">
                    {/* Efeito de fundo blur */}
                    <div className="absolute inset-0 bg-blue-900/30 rounded-full blur-2xl"></div>

                    {/* Container da imagem */}
                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                      <Image
                        src="/eu.jpg"
                        width={256} // Proporção correta (64 * 4 = 256px)
                        height={256} // Mesma proporção para imagem quadrada
                        alt="Foto de Kieran Rocha"
                        className="w-full h-full object-cover object-top"
                        priority // Carrega a imagem com prioridade
                      />
                    </div>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-4 tracking-tight">
                    Kieran Rocha
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-light text-[var(--color-secondary)]">
                    Bacharelado em Engenharia Mecânica
                  </h2>
                  <p className="text-lg max-w-2xl mx-auto leading-relaxed text-[var(--color-secondary)]">
                    Após anos de dedicação, projetos e descobertas, o sistema
                    atingiu a fase de conclusão. É hora de iniciar o protocolo
                    de celebração.
                  </p>
                  <div className="pt-10">
                    <button
                      onClick={handleStartHeating}
                      className="group relative inline-flex items-center px-10 py-5 bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                    >
                      <Thermometer className="w-6 h-6 mr-3" />
                      <span className="mr-2 text-lg">
                        Iniciar Aquecimento do Core
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TELA DE AQUECIMENTO (ATUALIZADA COM VARIÁVEIS) --- */}
            {currentStep === "heating" && (
              <div className="text-center animate-fade-in-up">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-4xl md:text-5xl font-bold text-white">
                      Sistema Aquecendo...
                    </h3>
                    <p className="text-xl text-[var(--color-secondary)]">
                      Analisando Transferência de Calor
                    </p>
                  </div>
                  <div className="relative w-64 h-64 mx-auto mb-8 rounded-full flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full animate-pulse-glow"
                      style={{
                        animationDuration: `${Math.max(
                          0.5,
                          2 - temperature / 100
                        )}s`,
                      }}
                    ></div>
                    <div className="absolute inset-4 rounded-full bg-slate-800 border-2 border-white/30 flex flex-col items-center justify-center text-white">
                      <Thermometer className="w-28 h-28 text-[var(--color-primary)] " />
                      <div className="text-5xl font-mono mt-4 text-[var(--color-primary)]">
                        {Math.round(temperature)}°C
                      </div>
                    </div>
                  </div>
                  <div className="max-w-lg mx-auto space-y-6">
                    <div className="relative">
                      <div className="w-full h-8 bg-gray-800 rounded-full border-2 border-gray-600 overflow-hidden">
                        <div
                          className="h-full temperature-progress"
                          style={{ width: `${temperature}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-[var(--color-secondary)] text-lg font-mono">
                      <Settings className="w-5 h-5 animate-spin" />
                      <span>
                        {temperature < 30 && "Inicializando subsistemas..."}
                        {temperature >= 30 &&
                          temperature < 60 &&
                          "Verificando integridade..."}
                        {temperature >= 60 &&
                          temperature < 90 &&
                          "Sincronizando protocolos..."}
                        {temperature >= 90 && "Sistema operacional!"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TELA DE DETALHES (ATUALIZADA COM VARIÁVEIS) --- */}
            {currentStep === "details" && (
              <div className="animate-fade-in-up">
                <div className="grid md:grid-cols-1 lg:grid-cols-1   items-start pt-16 md:pt-16 ">
                  <div className="md:col-span-2 lg:col-span-2 space-y-8">
                    <div className="text-center md:text-left">
                      <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Sistema Operacional!
                      </h3>
                      <p className="text-lg leading-relaxed text-[var(--color-secondary)]">
                        Motor atingiu temperatura ideal. Você está oficialmente
                        convidado para celebrar este marco especial.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4 p-6 bg-white/10 rounded-xl backdrop-blur-sm hover-lift border border-white/20">
                        <Calendar className="w-8 h-8 text-[var(--color-primary)] mt-1 flex-shrink-0 animate-pulse" />
                        <div>
                          <h4 className="text-white font-semibold text-xl mb-2">
                            Data & Dia
                          </h4>
                          <p className="text-[var(--color-secondary)] font-medium text-lg">
                            Sábado, 16 de Agosto de 2025
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-6 bg-white/10 rounded-xl backdrop-blur-sm hover-lift border border-white/20">
                        <Clock className="w-8 h-8 text-[var(--color-primary)] mt-1 flex-shrink-0 animate-pulse" />
                        <div>
                          <h4 className="text-white font-semibold text-xl mb-2">
                            Cronograma
                          </h4>
                          <div className="text-[var(--color-secondary)] space-y-1 text-base">
                            <p>
                              <strong>19:30</strong> - Recepção & Calibração
                            </p>
                            <p>
                              <strong>20:00</strong> - Jantar & Celebração
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-6 bg-white/10 rounded-xl backdrop-blur-sm hover-lift sm:col-span-2 border border-white/20">
                        <MapPin className="w-8 h-8 text-[var(--color-primary)] mt-1 flex-shrink-0 animate-pulse" />
                        <div>
                          <h4 className="text-white font-semibold text-xl mb-2">
                            Coordenadas do Evento
                          </h4>
                          <p className="text-[var(--color-secondary)] font-medium mb-1 text-lg">
                            Restaurante Gruta dos Índios
                          </p>
                          <p className="text-[var(--color-secondary)] text-sm mb-3">
                            Rua Capitão Pedro Werlang, 1570 - Higienópolis,
                            Santa Cruz do Sul - RS, 96825-325
                          </p>
                          <a
                            href="https://maps.app.goo.gl/Ji1JHUEMKFinZi7Y9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 text-[var(--color-primary)] hover:text-white transition-colors  text-base bg-white/10 rounded-full border border-white/20 transform hover:scale-105"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Ver no Mapa
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className=" hidden bg-gradient-to-r from-white/10 to-white/5 p-6 rounded-xl border border-[var(--color-accent)] border-opacity-20">
                      <h4 className="text-white font-semibold mb-4 text-center text-xl">
                        Jornada Acadêmica
                      </h4>
                      {/* Timeline permanece com cores fixas para representar os marcos */}
                      <div className="flex items-center justify-between text-center">
                        <div className="flex-1">
                          <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-2 animate-bounce"></div>
                          <p className="text-[var(--color-secondary)] text-xs md:text-sm">
                            2017
                          </p>
                          <p className="text-white text-sm md:text-base font-medium">
                            Início
                          </p>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-400 to-purple-400 opacity-50"></div>
                        <div className="flex-1">
                          <div className="w-3 h-3 bg-purple-400 rounded-full mx-auto mb-2 animate-bounce"></div>
                          <p className="text-[var(--color-secondary)] text-xs md:text-sm">
                            2023
                          </p>
                          <p className="text-white text-sm md:text-base font-medium">
                            Meio
                          </p>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-400 to-orange-400 opacity-50"></div>
                        <div className="flex-1">
                          <div className="w-4 h-4 bg-orange-400 rounded-full mx-auto mb-2  animate-bounce"></div>
                          <p className="text-[var(--color-secondary)] text-xs md:text-sm">
                            2025
                          </p>
                          <p className="text-white text-sm md:text-base font-medium">
                            Conclusão!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1 flex flex-col items-center justify-center pb-8">
                    <button
                      onClick={() => setShowRsvpModal(true)}
                      className="reflect-shimmer group relative inline-flex cursor-pointer items-center px-10 py-5 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105 shadow-pink-500/30 overflow-hidden"
                    >
                      <CheckCircle className="w-6 h-6 mr-3 relative z-10" />
                      <span className="text-lg relative z-10">
                        Confirmar Presença
                      </span>
                    </button>
                    <p className="text-yellow-600/80 text-sm mt-4 text-center">
                      Confirmação essencial para calibração
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* O restante do código (Modal, Confirmação) não precisa de grandes alterações, mas pode usar as variáveis para consistência */}
            {showRsvpModal && (
              <div className="fixed inset-0 bg-black/70  backdrop-blur-md flex items-center justify-center p-4 z-50 animate-scale-in">
                <div
                  className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-10 border border-white/30 max-w-md w-full"
                  style={{ borderColor: "var(--color-accent)" }}
                >
                  <button
                    onClick={() => setShowRsvpModal(false)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="text-center mb-6">
                    <h4 className="text-3xl font-bold text-white mb-2">
                      Registrar Presença
                    </h4>
                    <p className="text-[var(--color-secondary)] text-sm">
                      Preencha os dados no sistema
                    </p>
                  </div>
                  {/* O formulário continua igual, mas o botão de confirmação usará a cor do tema */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm">
                        <User className="w-4 h-4 inline mr-2" />
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={rsvpData.name}
                        onChange={(e) =>
                          setRsvpData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all text-sm"
                        placeholder="Seu nome completo"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone de Contato *
                      </label>
                      <input
                        type="tel"
                        value={rsvpData.phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setRsvpData((prev) => ({
                            ...prev,
                            phone: formatted,
                          }));
                        }}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all text-sm"
                        placeholder="(51) 99999-9999"
                        maxLength={15}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm">
                        Total de Convidados (Incluindo você)
                      </label>
                      <select
                        value={rsvpData.guests}
                        onChange={(e) =>
                          setRsvpData((prev) => ({
                            ...prev,
                            guests: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option
                            key={num}
                            value={num}
                            className="bg-slate-800 text-white"
                          >
                            {num} {num === 1 ? "Entrada" : "Entradas"}
                          </option>
                        ))}
                      </select>
                      {errors.guests && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.guests}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <button
                        type="button"
                        onClick={handleRSVP}
                        disabled={rsvpStatus === "loading"}
                        className="w-full bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-white font-semibold py-4 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                      >
                        {rsvpStatus === "loading" ? (
                          <span className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full  mr-2"></div>
                            Processando...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmar Presença
                          </span>
                        )}
                      </button>
                      {rsvpStatus === "error" && (
                        <p className="text-red-400 text-center text-xs mt-2">
                          ⚠️ Falha de conexão. Tente novamente.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "rsvp" && (
              <div className="text-center animate-fade-in-up">
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-600 rounded-full relative">
                    <CheckCircle className="w-12 h-12 text-white" />
                    <Star className="w-6 h-6 text-yellow-300 absolute -top-3 -right-3 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Sistema Confirmado!
                </h3>
                <p className="text-emerald-200 text-lg mb-8 max-w-2xl mx-auto">
                  Parabéns, <strong>{rsvpData.name}</strong>! Seu protocolo foi
                  registrado. Aguardo sua presença para a ativação final do
                  evento.
                </p>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 max-w-md mx-auto border border-white/20 hover-lift">
                  <h4 className="text-white font-semibold mb-4 text-xl">
                    Log do Sistema
                  </h4>
                  <div className="space-y-2 text-emerald-300 font-mono text-sm text-left">
                    <p>✓ Nome: {rsvpData.name}</p>
                    <p>✓ Telefone: {rsvpData.phone}</p>
                    <p>✓ Convidados: {rsvpData.guests}</p>
                    <p>✓ Status: CONFIRMADO</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://www.google.com/calendar/render?action=TEMPLATE&text=Formatura+Kieran+Rocha&dates=20251220T200000/20251220T230000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all border border-white/30 transform hover:scale-105"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Adicionar ao Calendário
                    </a>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/20">
                  <button
                    onClick={handleGoBack}
                    className="text-emerald-300 hover:text-white transition-colors text-sm"
                  >
                    ← Reiniciar Sistema
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

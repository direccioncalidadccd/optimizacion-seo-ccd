import React, { useState, useEffect, useRef, ReactNode } from "react";
import ExamAttemptDetails from "@/components/ui/bruno/ExamenDetalles";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Image,
  Divider,
} from "@nextui-org/react";
import {
  FaArrowLeft,
  FaArrowRightLong,
  FaCheck,
  FaClipboardList,
} from "react-icons/fa6";
import PieChart from "@/components/ui/bruno/PieChart";
import ExamHistory from "@/components/ui/bruno/Examenhistory";
import { Progress } from "@nextui-org/react";
import { LuAlarmClock, LuCopyCheck } from 'react-icons/lu';
import { FaAngleDoubleDown, FaAngleDoubleUp, FaCalendarAlt, FaRegCalendarAlt } from 'react-icons/fa';
import { motion } from "framer-motion"
import { PiExamFill } from "react-icons/pi";
import { X, Check } from 'lucide-react'
import { MdCancel, MdCheckCircle, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { adaptEventHandlers } from "recharts/types/util/types";
import { IoMdClose } from "react-icons/io";
import { IoTimerSharp } from "react-icons/io5";
import { PiListChecksLight } from "react-icons/pi";
import { useSession } from "next-auth/react";
import axios from "axios";
import { environment } from "@/environments/environment";
import { XIcon, CheckIcon, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CheckCircle2, XCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}
interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
  deadline: Date;
  questions: Question[];
}
interface ExamResult {
  details: QuestionResult[];
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timestamp: string;
  answers: Record<number, string>;
}
interface QuestionResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
interface ExamCardProps {
  Intentos: ReactNode;
  highestScore?: number;
  exam: Exam;
  onStartExam: (exam: Exam) => void;
  attempts: number;
  openSideSheet1: any;
  array: any;
}
interface ExamQuestionsProps {
  exam: Exam;
  onFinish: (results?: ExamResult) => void;
}
interface ExamHistoryProps {
  examId: number;
  attempts: ExamResult[];
}
interface ExamSystemState {
  selectedExam: Exam | null;
  isModalOpen: boolean;
  examHistory: Record<number, ExamResult[]>;
}
interface ExamQuestionsState {
  currentQuestion: number;
  answers: Record<number, string>;
  timeLeft: number;
  isFinished: boolean;
  results: any | null;
  visitedQuestions: any[];
  randomizedQuestions?: any[]; // Añadida esta nueva propiedad
}
// interface ExamResultNotificationProps {
//     isOpen: boolean;
//     onClose: () => void;
//     examData: any[]; // Replace with your specific exam data type
//     results: {
//         correctAnswers: number;
//     };
// }

interface Exam1 {
  id: number;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
}

const api = axios.create({
  baseURL: environment.baseUrl,
  headers: { "Content-Type": "application/json" },
});
// Datos de ejemplo tipados

const ModalExam: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[51]">
      <div className="bg-custom rounded-xl p-6 size-full overflow-y-auto" >
        <div className="flex justify-end">
          {/* <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button> */}
        </div>
        {children}
      </div>
    </div>
  );
};
const ExamCard: React.FC<ExamCardProps> = ({
  Intentos,
  exam,
  onStartExam,
  attempts = 0,
  highestScore = null,
  openSideSheet1,
  array,
}) => {
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

  // Función para verificar si el examen ha vencido
  const isExamExpired = () => {
    const now = new Date();
    return now > exam.deadline;
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const openModalResult = () => {
    onOpen();
  };

  const openSideSheet = () => {
    // Close any other open side sheets first
    setIsSideSheetOpen(true);
  };

  const closeSideSheet = () => {
    setIsSideSheetOpen(false);
  };

  const { data: session } = useSession();
  const [dataevaluaciones1, setdataevaluaciones1] = useState([]);
  const searchParams = useSearchParams();

  const pmodalidad = searchParams.get("pmodalidad");
  const psala = searchParams.get("psala");
  useEffect(() => {
    if (session?.user && pmodalidad == "En-Vivo") {
      const loadData = async () => {
        try {
          const responseTipoDocumento = await api.post(
            "/inicio/listarevaluacionesnotavivoxusuariov2",
            {
              fusuario_id: session?.user.uid,
              fevaluacion_id: array.IdEvaluacion,
              fsala_id: psala,
            }
          );
          setdataevaluaciones1(responseTipoDocumento.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
    if (session?.user && pmodalidad == "Asincrónico") {
      const loadData = async () => {
        try {
          const responseTipoDocumento = await api.post(
            "/inicio/listarevaluacionesnotaxusuariov2",
            {
              fusuario_id: session?.user.uid,
              fevaluacion_id: array.IdEvaluacion,
            }
          );
          setdataevaluaciones1(responseTipoDocumento.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
  }, [session?.user.Usuario]);

  const isLocked = array.FechaInicio
    ? new Date(array.FechaInicio) > new Date()
    : false;

  function convertirFechaPeru(fechaISO: string) {
    if (!fechaISO) return "Fecha no disponible";

    // Convertir manualmente el string "YYYY-MM-DD" a un objeto Date
    const partes = fechaISO.split("-");
    const fecha = new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    );

    // Opciones de formato
    const opciones: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    return fecha.toLocaleDateString("es-PE", opciones);
  }
  return (
    <>
      <div
        className={`
        relative group
        bg-[var(--colorccd3)] border border-blue-400/20 rounded-2xl
        h-[23rem] p-4 transition-all duration-300
        ${isLocked
            ? "opacity-75 cursor-not-allowed"
            : "hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-400/10 cursor-pointer"
          }
      `}
        onClick={isLocked ? undefined : () => openSideSheet1(dataevaluaciones1, exam)}
      >
        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-[var(--colorccd3)]/50 rounded-2xl backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-[var(--colorccd1-transparent)] p-4 rounded-xl backdrop-blur-md">
              <p className="text-white/90 text-sm !m-0">
                Disponible desde: {convertirFechaPeru(array.FechaInicio!)}
              </p>
            </div>
          </div>
        )}

        {/* Image Container */}
        <div className="relative h-[55%] w-full overflow-hidden rounded-xl mb-4 group-hover:shadow-md transition-shadow duration-300">
          <Image
            src={array.TipoEvaluacion == 1 ? '/Multimedia/evaluacion/fotoevaluacionparcial.png' : (array.TipoEvaluacion == 2 ? '/Multimedia/evaluacion/fotoevaluacionfinal.png' : '')}
            alt={array.Evaluacion}
            className="object-cover transition-transform duration-500 group-hover:scale-105 z-1"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--colorccd3)] via-transparent to-transparent opacity-50" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl text-white font-semibold tracking-tight">{array.Evaluacion}</h3>

          <hr className="border-blue-400/20" />

          <div className="space-y-2">
            {/* Duration */}
            <div className="flex items-center gap-2 text-white/90">
              <IoTimerSharp className="text-blue-400/80" />
              <span className="text-sm">Duración: {array.Duracion} minutos</span>
            </div>

            {/* Attempts */}
            <div className="flex items-center gap-2 text-white/90">
              <PiListChecksLight className="text-blue-400/80" />
              <span className="text-sm">Intentos: {array.Intentos} intentos restantes</span>
            </div>

            {/* End Date - Only show if FechaFin exists */}
            {array.FechaFin && (
              <div className="flex items-center gap-2 text-white/90">
                <FaCalendarAlt className="text-blue-400/80" />
                <span className="text-sm">Fecha de cierre: {convertirFechaPeru(array.FechaFin)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
const ExamQuestions: React.FC<ExamQuestionsProps> = ({
  exam,
  onFinish,
}: any) => {
  const [dataquiz, setdataquiz] = useState<Exam1[]>([]);
  const { data: session } = useSession();
  const [state, setState] = useState<ExamQuestionsState | null>();
  const [notification, setNotification] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isFinishingRef = useRef(false);
  const questions = state?.randomizedQuestions || dataquiz[0]?.questions;
  const currentQuestion =
    questions && state ? questions[state.currentQuestion] : null;
  const timeLeftMinutes = state ? Math.floor(state.timeLeft / 60) : 0;
  const timeLeftSeconds = state ? state.timeLeft % 60 : 0;
  const searchParams = useSearchParams();

  const pmodalidad = searchParams.get("pmodalidad");
  const psala = searchParams.get("psala");
  const pid = searchParams.get("pid");

  useEffect(() => {
    if (session?.user) {
      const loadData = async () => {
        try {
          const responseTipoDocumento = await api.post(
            "/inicio/listarpreguntasxevaluacionv2",
            {
              fevaluacion_id: exam.IdEvaluacion,
            }
          );

          const data = responseTipoDocumento.data.data[0];
          setdataquiz(data);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
  }, [session?.user.Usuario]);
  useEffect(() => {
    if (dataquiz.length > 0) {
      const examId = dataquiz[0]?.id;

      // Evitar operaciones si no hay un ID válido
      if (!examId) return;

      const savedState = localStorage.getItem(`exam-${examId}-${pid}`);


      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);

          // Calcular tiempo restante
          const savedStartTime = localStorage.getItem(
            `exam-${examId}-${pid}-start-time`
          );
          let remainingTime = dataquiz[0]?.duration * 60;

          if (savedStartTime) {
            const startTime = parseInt(savedStartTime, 10);
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            remainingTime = Math.max(0, remainingTime - elapsedTime);
          }

          setState({
            ...parsedState,
            timeLeft: remainingTime,
            visitedQuestions: parsedState.visitedQuestions || [0],
          });
        } catch (error) {
          console.error("Error al parsear el estado guardado:", error);
        }
      } else {
        // Generar preguntas aleatorias
        const randomizedQuestions = getRandomQuestions(
          dataquiz[0]?.questions,
          20
        );

        // Guardar el tiempo de inicio
        localStorage.setItem(
          `exam-${examId}-${pid}-start-time`,
          Date.now().toString()
        );


        // Estado inicial
        setState({
          currentQuestion: 0,
          answers: {},
          timeLeft: dataquiz[0]?.duration * 60,
          isFinished: false,
          results: null,
          visitedQuestions: [0],
          randomizedQuestions,
        });
      }
    }
  }, [dataquiz, pid]);
  useEffect(() => {
    // Guardar estado cada vez que cambia
    if (dataquiz[0]?.id && pid) {
      localStorage.setItem(`exam-${dataquiz[0]?.id}-${pid}`, JSON.stringify(state));
    }
  }, [state, dataquiz[0]?.id, pid]);
  useEffect(() => {
    if (state) {
      const answeredQuestions = Object.keys(state.answers).length;
      const totalQuestions =
        state.randomizedQuestions?.length || dataquiz[0]?.questions.length;
      const progress = (answeredQuestions / totalQuestions) * 100;
      setProgressValue(progress);
    }
  }, [
    state && state.answers,
    state && state.randomizedQuestions,
    dataquiz[0]?.questions.length,
  ]);
  useEffect(() => {
    localStorage.setItem(`exam-${dataquiz[0]?.id}`, JSON.stringify(state));
  }, [state, dataquiz[0]?.id]);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state && state.timeLeft > 0 && !state.isFinished) {
      timer = setInterval(() => {
        setState((prev: any) => {
          if (prev.timeLeft <= 1 && !isFinishingRef.current) {
            isFinishingRef.current = true;
            setNotification(
              "El examen se cerrará automáticamente por límite de tiempo."
            );
            setTimeout(() => {
              finishExam();
            }, 0);
          }
          return {
            ...prev,
            timeLeft: Math.max(0, prev.timeLeft - 1),
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state && state.timeLeft, state && state.isFinished]);
  const handlePreviousQuestion = (): void => {
    if (state && state.currentQuestion > 0) {
      setState((prev: any) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };
  function FinalizarExamen() {
    if (Object.keys(state?.answers!).length == 10) {
      onOpen()
    } else {
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Faltan preguntas por responder!",
        text: "Por favor terminar con todas las preguntas para poder finalizar",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Entendido",
        allowOutsideClick: false,
      })
    }
  }
  useEffect(() => {
    if (state?.isFinished) {
      console.log("Estado finalizado:", JSON.stringify(state));
    }
  }, [state?.isFinished]);
  function getRandomQuestions(questions: any[], count: number) {
    const shuffled = shuffleQuestions(questions);
    return shuffled.slice(0, count);
  }
  function shuffleQuestions(questions: any[]): any[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  const handleAnswer = (
    questionId: number,
    answer: string,
    idanswer: string,
    orden: string
  ): void => {
    if (state && !state.isFinished) {
      setState((prev: any) => ({
        ...prev,
        answers: { ...prev.answers, [questionId]: { answer, idanswer, orden } },
      }));
    }
  };
  const navigateToQuestion = (index: number): void => {
    if (state?.visitedQuestions && state.visitedQuestions.includes(index)) {
      setState((prev: any) => ({
        ...prev,
        currentQuestion: index,
      }));
    }
  };
  const handleNextQuestion = (): void => {
    const totalQuestions =
      (state && state.randomizedQuestions?.length) ||
      dataquiz[0]?.questions.length;

    if (state?.currentQuestion! < totalQuestions - 1) {
      const nextQuestion = state?.currentQuestion! + 1;
      setState((prev: any) => ({
        ...prev,
        currentQuestion: nextQuestion,
        visitedQuestions:
          prev.visitedQuestions && prev.visitedQuestions.includes(nextQuestion)
            ? prev.visitedQuestions
            : [...(prev.visitedQuestions || [0]), nextQuestion],
      }));
    }
  };
  const finishExam = (): void => {
    localStorage.removeItem(`exam-${dataquiz[0]?.id}-start-time`); // Limpiar tiempo de inicio al finalizar el examen
    if (state) {
      const questions = state.randomizedQuestions || dataquiz[0]?.questions;
      const examResults: QuestionResult[] = questions.map((q: any) => ({
        question: q.question,
        userAnswer: (state.answers[q.id] as any).answer || "Sin responder",
        correctAnswer: q.correctAnswer,
        isCorrect: (state.answers[q.id] as any).answer === q.correctAnswer,
      }));
      const correctAnswers = examResults.filter((r) => r.isCorrect).length;
      const totalQuestions = questions.length;

      if (session?.user) {
        guardarEvaluacion(((correctAnswers / totalQuestions) * 20).toFixed(1));
      }
      const results = {
        notafinal: ((correctAnswers / totalQuestions) * 20).toFixed(1),
        notaporcentaje: ((correctAnswers / totalQuestions) * 100).toFixed(2),
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        totalQuestions,
        timeLeft: state.timeLeft,
      };
      setState((prev: any) => ({
        ...prev,
        isFinished: true,
        results,
        visitedQuestions: [0],
      }));
      onFinish(results);
      clearExamData();
    }

    /*
              
                   const results: ExamResult = {
                       details: examResults,
                       score: (correctAnswers / totalQuestions) * 100,
                       correctAnswers,
                       totalQuestions,
                       timestamp: new Date().toISOString(),
                       answers: { ...state.answers },
                   };
                   setState((prev: any) => ({ ...prev, isFinished: true, results }));
       
                   //
               }
               //;*/
  };
  const clearExamData = (): void => {
    localStorage.removeItem(`exam-${dataquiz[0]?.id}-${pid}`);
    localStorage.removeItem(`exam-${dataquiz[0]?.id}-${pid}-start-time`);
  };
  const guardarEvaluacion = async (finalScore: string) => {
    if (pmodalidad == 'En-Vivo') {
      const responseTipoDocumento = await api.post("/inicio/guardarevaluacionvivov2", {
        fevaluacion_id: exam.IdEvaluacion,
        fusuario_id: session?.user.uid,
        fnota: finalScore,
        respuestas: state?.answers!,
        fduracionev: 60,
        fsala_id: psala,
        fproducto_id: pid
      });

    } if (pmodalidad == 'Asincrónico') {
      const responseTipoDocumento = await api.post("/inicio/guardarevaluacionv2", {
        fevaluacion_id: exam.IdEvaluacion,
        fusuario_id: session?.user.uid,
        fnota: finalScore,
        respuestas: state?.answers!,
        fduracionev: 60,
        fproducto_id: pid
      });

    }

  };
  // Vista de resultados
  if (state && state.isFinished && state.results) {

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Resultados del Examen</h2>
        <div className="mb-6">
          <p className="text-xl">
            Puntuación: {state.results.score.toFixed(1)}%
          </p>
          <p className="text-lg">
            Respuestas correctas: {state.results.correctAnswers} de{" "}
            {state.results.totalQuestions}
          </p>
        </div>

        {notification && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-xl">
            {notification}
          </div>
        )}

        <div className="space-y-4">
          {state.results.details.map((result: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${result.isCorrect ? "bg-green-50" : "bg-red-50"}`}
            >
              <p className="font-medium mb-2">{result.question}</p>
              <p className="text-sm">Tu respuesta: {result.userAnswer}</p>
              <p className="text-sm">
                Respuesta correcta: {result.correctAnswer}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='flex justify-center items-center size-full relative z-[99]'>
        <div className="p-5 flex max-lg:flex-col   gap-10 max-lg:gap-0 w-[80%] mx-auto  max-lg:w-full max-sm:h-full ">
          <div className='flex flex-col w-[30%] max-lg:w-full '>
            <div className="flex flex-col max-lg:flex-row gap-4 max-lg:gap-0  max-sm:gap-4 justify-start items-start max-lg:justify-between max-lg:items-center mb-6 max-sm:flex-col">
              <h2 className=" bg-white/80 flex gap-2 text-2xl w-full max-lg:w-auto  max-sm:w-full font-bold p-4 rounded-xl  border-1 text-blue-1"> {dataquiz[0]?.title}</h2>
              <div className="bg-white/80 flex gap-2 items-center  w-full max-lg:w-auto  max-sm:w-full  font-semibold p-4 rounded-xl  border-1">
                <LuAlarmClock className='text-3xl text-blue-1' />
                <div className='text-xl'>Tiempo restante: {timeLeftMinutes}:
                  {timeLeftSeconds.toString().padStart(2, "0")}</div>
              </div>
            </div>
            <div className="mb-6 flex flex-wrap gap-2 justify-center rounded-xl shadow-2xl border-1 p-2 bg-white/80 ">
              {questions?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${state && !state.visitedQuestions?.includes(index)
                      ? 'bg-gray-200 cursor-not-allowed opacity-50'
                      : state?.answers[questions[index].id]
                        ? 'bg-green-500 text-white'
                        : state?.currentQuestion === index
                          ? 'bg-[var(--colorccd1)] text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                    }
                        `}
                  disabled={!state?.visitedQuestions?.includes(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div className='w-[70%] bg-white/80  max-lg:w-full p-4 rounded-xl shadow-2xl borde-2  '>
            <div className="mb-6">
              <Progress
                aria-label="Progreso del examen"
                size="md"
                value={progressValue}
                color="success"
                showValueLabel={true}
                className="max-w-full"
                label="Preguntas respondidas"
              />
            </div>
            {notification && (
              <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-xl">
                {notification}
              </div>
            )}
            <div className="mb-8">
              <p className="text-lg mb-4">
                Pregunta {state && state.currentQuestion + 1} de {questions?.length}
              </p>
              <p className="text-xl mb-6">{currentQuestion?.question}</p>

              <div className="space-y-4">
                {currentQuestion?.options.map((option: any, index: any) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option.option, option.idoption, option.orden)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${(state?.answers[currentQuestion.id] as any)?.answer === option.option
                      ? "bg-blue-50 border-blue-500"
                      : "hover:bg-gray-50 border-gray-200"
                      }`}
                  ><span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option.option}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={(state && state.currentQuestion) === 0}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              {state && state.currentQuestion === questions!.length - 1 ? (
                <button
                  onClick={() => FinalizarExamen()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Finalizar Examen
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2  text-white rounded hover:bg-[var(--colorccd1)] bg-[var(--colorccd1)]"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        placement="center"
        isKeyboardDismissDisabled={true}
        size="lg"
        classNames={{ "base": "z-[60]", "backdrop": "z-[60]", "body": "z-[60]", "wrapper": "z-[60]" }}
      >
        <ModalContent >
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col text-5xl font-bold text-center gap-1">
                <h2 className="text-2xl font-bold text-gray-800 text-center">Confirmación</h2>                            </ModalHeader>
              <ModalBody>
                <div className="px-6 py-4 flex flex-col items-center">
                  <h3 className="text-xl font-semibold text-[#007FEE] text-center mb-6">
                    ¿Estás seguro de enviar tus respuestas?
                  </h3>

                  {/* Robot Icon */}
                  <div className="w-24 h-24 bg-[#EEF6FF] rounded-full flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white rounded-full border-4 border-[#007FEE] flex items-center justify-center">
                        <div className="w-10 h-5 bg-[#007FEE] rounded-full flex items-center justify-around">
                          <div className="w-3 h-3 bg-[#00BFFF] rounded-full"></div>
                          <div className="w-3 h-3 bg-[#00BFFF] rounded-full"></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#B3DAFF] rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-[#007FEE] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-around">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors duration-300 min-w-[120px]"
                >
                  <X size={18} className="mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={() => finishExam()}
                  className="px-6 py-2.5 bg-[#007FEE] text-white font-medium rounded-xl flex items-center justify-center hover:bg-[#0066CC] transition-colors duration-300 min-w-[120px]"
                >
                  <Check size={18} className="mr-2" />
                  Confirmar
                </button>

              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const ExamSystem: React.FC = () => {

  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const pmodalidad = searchParams.get("pmodalidad");
  const psala = searchParams.get("psala");

  const storageKey = `examSystemState_${pid}`;


  const [state, setState] = useState<ExamSystemState>(() => {
    const savedState = JSON.parse(
      localStorage.getItem(storageKey) || "{}"
    );
    return {
      selectedExam: savedState.selectedExam || null,
      isModalOpen: savedState.isModalOpen || false,
      examHistory: savedState.examHistory || {},
    };
  });

  // Nuevo estado para el modal de resultados
  const [scoreNotificationModal, setScoreNotificationModal] = useState({
    isOpen: false,
    onOpenChange: (open: boolean) =>
      setScoreNotificationModal((prev) => ({ ...prev, isOpen: open })),
  });

  // Estados para mantener el intento seleccionado
  const [selectedAttempt, setSelectedAttempt] = useState<ExamResult | null>(
    null
  );
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState<number>(0);

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return "text-green-500"; // Excelente puntuación
    } else if (score >= 50) {
      return "text-yellow-500"; // Puntuación intermedia
    } else {
      return "text-red-500"; // Puntuación baja
    }
  };

  const handleStartExam = (exam: any): void => {
    const attempts = exam.length;
    if (attempts >= 3) {
      alert("Has alcanzado el máximo de intentos para este examen");
      return;
    }
    setState((prev) => {
      const newState = {
        ...prev,
        selectedExam: exam,
        isModalOpen: true,
      };
      localStorage.setItem(storageKey, JSON.stringify(newState));
      return newState;
    });
  };

  const handleCloseExam = (): void => {
    setState((prev) => {
      const newState = {
        ...prev,
        selectedExam: null,
        isModalOpen: false,
      };
      localStorage.setItem(storageKey, JSON.stringify(newState));
      return newState;
    });
  };

  const saveAttempt = (examId: number, results: ExamResult): void => {
    setState((prev) => {
      const newState = {
        ...prev,
        examHistory: {
          ...prev.examHistory,
          [examId]: [...(prev.examHistory[examId] || []), results],
        },
      };
      localStorage.setItem(storageKey, JSON.stringify(newState));

      // Configurar los datos para el modal de resultados
      const attemptNumber = (newState.examHistory[examId] || []).length;
      setSelectedAttempt(results);
      setSelectedAttemptNumber(attemptNumber);
      setScoreNotificationModal((prev) => ({ ...prev, isOpen: true }));

      return newState;
    });
  };


  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [datamodalev, setdatamodalev] = useState<any>(null);

  const openSideSheet = (curso: any, modal: any) => {
    setdatamodalev(modal);
    setSelectedCourse(curso);
    setIsOpen(true);
  };



  const { data: session } = useSession();
  const [dataevaluaciones, setdataevaluaciones] = useState([]);

  useEffect(() => {
    if (session?.user && pmodalidad == "Asincrónico") {
      const loadData = async () => {
        try {
          const responseTipoDocumento = await api.post(
            "/inicio/listarevaluacionesxcursov2",
            {
              fproducto_id: pid,
            }
          );
          setdataevaluaciones(responseTipoDocumento.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
    if (session?.user && pmodalidad == "En-Vivo") {
      const loadData = async () => {
        try {
          const responseTipoDocumento = await api.post(
            "/inicio/listarevaluacionesvivoxcursov2",
            {
              fproducto_id: pid,
              fsala_id: psala,
            }
          );
          setdataevaluaciones(responseTipoDocumento.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
  }, [session?.user.Usuario]);

  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onOpenChange: onOpenChange1,
  } = useDisclosure();
  const openModalResult = () => {
    onOpen1();
  };
  const [datosev, setdatosev] = useState<any>(null);
  const {
    isOpen: isopenresultado,
    onOpen: onopenresultado,
    onOpenChange: onopenchangeresultado,
  } = useDisclosure();

  interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
  }

  interface Question1 {
    id: number;
    text: string;
    options: Option[];
  }

  const [dataevaluacionesrespondida, setdataevaluacionesrespondida] = useState(
    []
  );
  const [textotituloevaluacion, settextotituloevaluacion] = useState("");
  function convertirFechaPeru(fechaISO: string) {
    if (!fechaISO) return "Fecha no disponible";

    // Convertir manualmente el string "YYYY-MM-DD" a un objeto Date
    const partes = fechaISO.split("-");
    const fecha = new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    );

    // Opciones de formato
    const opciones: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    return fecha.toLocaleDateString("es-PE", opciones);
  }
  async function verintento(IdEvaluacionNota: any, titulo: any) {
    onopenresultado();
    const responseTipoDocumento = await api.post(
      "/inicio/listarpreguntasmarcadasxevaluacionv2",
      {
        fevaluacionnota_id: IdEvaluacionNota,
      }
    );
    setdataevaluacionesrespondida(responseTipoDocumento.data.data[0]);
    settextotituloevaluacion(titulo);
  }
  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataevaluaciones.map((exam: any) => {
          return (
            <div key={exam.id} >
              <ExamCard
                exam={exam}
                onStartExam={handleStartExam}
                attempts={(state.examHistory[exam.id] || []).length}
                highestScore={
                  state.examHistory[exam.id]
                    ? Math.max(...state.examHistory[exam.id].map(attempt => attempt.correctAnswers * 20 / attempt.totalQuestions))
                    : undefined
                }
                Intentos={
                  <ExamHistory
                    examId={exam.id}
                    attempts={state.examHistory[exam.id] || []}
                  />
                }
                openSideSheet1={openSideSheet}
                array={exam}
              />

            </div>
          )
        })}
      </div>
      {isOpen && datamodalev && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ pointerEvents: 'none' }}>
          <div
            className=" w-[25%] max-xl:w-[24rem] h-full bg-[var(--colorccd3)] shadow-xl  absolute right-0 top-0 "
            style={{ pointerEvents: 'auto' }}
          >
            <div className="min-h-screen bg-[var(--colorccd3)]  flex  justify-center">
              <div className="w-full  bg-[var(--colorccd3)] backdrop-blur-sm  shadow-xl border border-slate-800">
                {/* Header */}

                <div className="flex px-5 items-center gap-4 pt-5">
                  <Button className="bg-[var(--colorccd1)] py-1.5 !px-3 text-white !min-w-0">
                    <PiExamFill className='text-2xl' />

                  </Button>
                  <motion.span
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="text-xl inline-block text-transparent bg-clip-text 
                                                                            bg-gradient-to-r from-blue-100 to-blue-300
                                                                              dark:from-blue-300 dark:to-purple-300"
                  >
                    {datamodalev.Evaluacion}
                  </motion.span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Date Range */}
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[var(--colorccd1-transparent)]">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-400">{pmodalidad == 'Asincrónico' ? 'Fecha de inicio' : ''} {pmodalidad == 'En-Vivo' ? 'Fecha de inicio - Fecha de cierre' : ''}</div>
                      <div className="flex items-center gap-3 mt-1">
                        {pmodalidad == 'En-Vivo' ? (<>  <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-emerald-400">{convertirFechaPeru(datamodalev.FechaInicio)}</span>
                        </div>
                          <span className="text-slate-600">-</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-red-400">{convertirFechaPeru(datamodalev.FechaFin)}</span>
                          </div></>) : ''}
                        {pmodalidad == 'Asincrónico' ? (<>  <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-emerald-400">Inmediato</span>
                        </div>
                        </>) : ''}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[var(--colorccd1-transparent)]">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-400">Duración</div>
                      <div className="text-white mt-1">{datamodalev.Duracion} minutos</div>
                    </div>
                  </div>

                  {/* Attempts */}
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[var(--colorccd1-transparent)]">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-400">Intentos</div>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedCourse.length < 3 ? (
                          <>
                            <span className="text-white">
                              {3 - selectedCourse.length} intentos restantes
                            </span>
                            <div className="flex gap-1">
                              {[...Array(3 - selectedCourse.length)].map((_, index) => (
                                <div key={index} className="w-2 h-2 rounded-full bg-[var(--colorccd1)]"></div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-red-500 font-semibold">No quedan intentos restantes</span>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grading Method */}
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[var(--colorccd1-transparent)]">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-400">Método de calificación</div>
                      <div className="text-white mt-1">Calificación más alta</div>
                    </div>
                  </div>

                  {/* Attempts History */}
                  <div className="mt-6 space-y-4">

                    {selectedCourse.map((course: any, index: number) => (

                      <div key={index} className="bg-[#0B1025] rounded-xl p-4 group hover:bg-slate-800/70 transition-all cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">Intento {course.Intento}</span>
                            <Button
                              className="text-xs px-3 py-1 rounded-full bg-[var(--colorccd1-transparent)] text-blue-400 hover:bg-[var(--colorccd1)] transition-colors"
                              onClick={() => {

                                verintento(course.IdEvaluacionNota, datamodalev.Evaluacion)
                              }}
                            >
                              Ver intento
                            </Button >
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-white">{course.Nota}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          </div>
                        </div>
                      </div>
                    ))
                    }

                    <div className="bg-[#0B1025] rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Nota final</span>
                        <span className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {selectedCourse.length > 0
                            ? `${Math.max(...selectedCourse.map((course: any) => course.Nota))} / 20`
                            : '0 / 20' // Valor predeterminado si no hay cursos
                          }
                        </span>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800">
                  {selectedCourse.length == 3 ? (<Button disabled={true} className='bg-[var(--colorccd1)] text-white w-full p-4 rounded-2xl' onClick={openModalResult}>
                    Intentos Agotados
                  </Button>) : (<Button disabled={selectedCourse.length > 3} className='bg-[var(--colorccd1)] text-white w-full p-4 rounded-2xl' onClick={openModalResult}>
                    Iniciar intento número {selectedCourse.length + 1}
                  </Button>)}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      <ModalExam isOpen={state.isModalOpen} onClose={handleCloseExam}>
        {state.selectedExam && (
          <ExamQuestions
            exam={state.selectedExam}
            onFinish={(results?: ExamResult) => {
              if (results) {
                saveAttempt(state.selectedExam!.id, results);
              }
              setdatosev(results)
              setScoreNotificationModal(prev => ({ ...prev, isOpen: true }));
              handleCloseExam();
            }}
          />
        )}
      </ModalExam>

      {/* Modal de Resultados */}
      <Modal
        isOpen={scoreNotificationModal.isOpen}
        onOpenChange={scoreNotificationModal.onOpenChange}

        size="4xl"
        placement='center'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="flex flex-col items-center gap-6 p-6 bg-white ">

                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl" role="dialog">
                    <div className="p-6 relative">
                      <button
                        onClick={() => window.location.reload()}
                        className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                        <span className="sr-only">Cerrar</span>
                      </button>

                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resultados del Examen</h2>
                        <p className="text-slate-500 dark:text-slate-400">Resumen de tu desempeño</p>
                      </div>

                      <div className="flex justify-center mb-8">
                        <div className="relative">
                          <svg className="w-32 h-32">
                            <circle
                              className="text-slate-200 dark:text-slate-800"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="56"
                              cx="64"
                              cy="64"
                            />
                            <circle
                              className={datosev.notaporcentaje >= 60 ? "text-green-500" : "text-blue-500"}
                              strokeWidth="8"
                              strokeDasharray={`${datosev.notaporcentaje * 3.51} 351`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="56"
                              cx="64"
                              cy="64"
                            />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{datosev.notaporcentaje}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Correctas</div>
                          <div className="text-xl font-semibold text-green-500">{datosev.correctAnswers}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Incorrectas</div>
                          <div className="text-xl font-semibold text-blue-500">{datosev.incorrectAnswers}</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-300">Total de preguntas</span>
                          <span className="font-medium text-slate-900 dark:text-white">{datosev.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-300">Tiempo empleado</span>
                          <span className="font-medium text-slate-900 dark:text-white">{`${Math.floor(datosev.timeLeft / 60)} minutos y ${datosev.timeLeft % 60} segundos`}</span>
                        </div>

                      </div>

                      <div className="flex justify-center gap-3">
                        <div className={`px-4 py-2 rounded-full ${datosev.notafinal >= 14 ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}>
                          {datosev.notafinal >= 14 ? 'Aprobado' : 'No Aprobado'}
                        </div>
                        <Button color="danger" variant="flat" onPress={onClose}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpen1}
        onOpenChange={onOpenChange1}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        placement="center"
        size="lg"
      >
        <ModalContent className='bg-[var(--colorccd3)]'>
          {(onClose) => (
            <>

              <ModalBody>
                {/* Content */}
                <div className="rounded-2xl py-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Confirmación
                    </h3>

                    {/* Icon Container */}
                    <div className="my-6 flex justify-center">
                      <div className="relative">
                        {/* Outer Ring Animation */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse" />

                        {/* Icon Background */}
                        <div className="relative h-24 w-24 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-600/20 p-5">
                          <AlertCircle className="h-full w-full text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <p className="text-lg text-gray-300 mb-8">
                      ¿Estás seguro de comenzar el examen?
                    </p>

                    {/* Additional Info */}
                    <div className="mb-8 space-y-3 rounded-xl bg-blue-950/30 p-4">
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Duración: 50 minutos</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Intentos: 3 intentos restantes</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-center space-x-4">
                    <Button
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-600 bg-transparent px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#141829] transition-colors"
                      onPress={onClose}
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#141829] transition-all transform hover:scale-105"
                      onPress={() => {
                        handleStartExam(datamodalev);
                        onOpenChange1();
                      }}
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Comenzar
                    </Button>
                  </div>
                </div>
              </ModalBody>

            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isopenresultado}
        onOpenChange={onopenchangeresultado}
        size='3xl'
      >
        <ModalContent className='h-[80%] overflow-auto  bg-[var(--colorccd3)]'>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="min-h-screen bg-[var(--colorccd3)]  px-4">
                  <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                      <h1 className="text-3xl font-bold text-white">{textotituloevaluacion}</h1>
                      <p className="text-[#4d7cfe] mt-2">Revisión del examen.</p>
                    </header>

                    <div className="space-y-8">
                      {dataevaluacionesrespondida.map((item: any, index: number) => (
                        <div key={index} className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg flex flex-col gap-4">
                          {item.questions.map((item1: any, index: number) => (
                            <div key={index} className="">
                              <h2 className="text-xl font-semibold text-white mb-[1rem]">
                                {index + 1}. {item1.question}
                              </h2>
                              <div className="grid gap-3 mt-3">
                                {item1.options.map((item2: any, index: number) => (
                                  <div
                                    key={index}
                                    className={`p-3 rounded-xl transition-all duration-200 
                                                                       ${item1.marcado.toString() === item2.orden.toString()
                                        ? item1.marcado.toString() === item1.correctAnswer
                                          ? 'bg-[var(--colorccd3)] border border-green-400' // Correcto y marcado
                                          : 'bg-[var(--colorccd3)] border border-red-400'  // Incorrecto y marcado
                                        : 'bg-[var(--colorccd3)] border border-[#2a2331]' // No marcado
                                      }`}
                                  >
                                    <label className="flex items-center cursor-pointer">
                                      {/* Botón de selección con borde dinámico */}
                                      <span
                                        className={`w-5 h-5 mr-3 border rounded-full flex items-center justify-center 
                                                                               ${item1.marcado.toString() === item2.orden.toString()
                                            ? item1.marcado.toString() === item1.correctAnswer
                                              ? 'border-green-400' // Correcto y marcado
                                              : 'border-red-400'  // Incorrecto y marcado
                                            : 'border-gray-500' // No marcado
                                          }`}
                                      >
                                        {/* Indicador interno dinámico */}
                                        <span
                                          className={`w-3 h-3 rounded-full 
                                                                                   ${item1.marcado.toString() === item2.orden.toString()
                                              ? item1.marcado.toString() === item1.correctAnswer
                                                ? 'bg-green-400 opacity-100'
                                                : 'bg-red-400 opacity-100 '
                                              : 'opacity-0'
                                            } transition-opacity duration-200`}
                                        ></span>
                                      </span>

                                      {/* Texto dinámico con color según estado */}
                                      <span
                                        className={`text-lg 
                                                                               ${item1.marcado.toString() === item2.orden.toString()
                                            ? item1.marcado.toString() === item1.correctAnswer
                                              ? 'text-green-400' // Correcto y marcado
                                              : 'text-red-400'  // Incorrecto y marcado
                                            : 'text-white' // No marcado
                                          }`}
                                      >
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                                        {item2.option}
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                          }
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={onopenchangeresultado}
                        className="px-6 py-3 bg-[#4d7cfe] hover:bg-[#3d63cb] transition-colors duration-200 rounded-xl text-white font-medium"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </ModalBody>

            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );

}


export default ExamSystem;

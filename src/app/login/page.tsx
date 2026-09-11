import { ROOM_SIZE, DRAWING_SECONDS, VOTING_SECONDS } from "@/lib/game/constants";
import { formatDurationAccusativeRu, pluralRu } from "@/lib/formatDuration";
import { STEP_STYLES } from "./constants";
import { LoginView } from "./LoginView";

const LoginPage = () => {
  const steps = [
    {
      ...STEP_STYLES[0],
      title: `${ROOM_SIZE} ${pluralRu(ROOM_SIZE, "человек", "человека", "человек")} в комнате`,
      text: "Все получают одно задание одновременно",
    },
    {
      ...STEP_STYLES[1],
      title: `${formatDurationAccusativeRu(DRAWING_SECONDS)} рисуем`,
      text: "В браузере или фото рисунка с бумаги",
    },
    {
      ...STEP_STYLES[2],
      title: `${formatDurationAccusativeRu(VOTING_SECONDS)} голосуем`,
      text: "Кому меньше всех минусов — тот победил",
    },
  ];

  return <LoginView steps={steps} />;
};

export default LoginPage;

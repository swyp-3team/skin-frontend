import { useEffect, useState } from "react";

import { apiClient } from "../../api";
import type { SurveyQuestion } from "../../api/types";

interface UseSurveyQuestionsResult {
  questions: SurveyQuestion[];
  isLoadingQuestions: boolean;
  questionLoadError: string | null;
}

export function useSurveyQuestions(): UseSurveyQuestionsResult {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      setQuestionLoadError(null);

      try {
        const response = await apiClient.getSurveyQuestions();
        if (!isMounted) {
          return;
        }
        setQuestions(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "설문 문항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
        setQuestionLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    void loadQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    questions,
    isLoadingQuestions,
    questionLoadError,
  };
}

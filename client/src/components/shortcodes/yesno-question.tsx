import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface YesNoQuestionProps {
  question: string;
  questionId: string;
  documentId: string;
}

export default function YesNoQuestion({ question, questionId, documentId }: YesNoQuestionProps) {
  const [userResponse, setUserResponse] = useState<string | null>(null);
  const { toast } = useToast();

  // Get response counts
  const { data: counts, isLoading } = useQuery<{ yes: number; no: number }>({
    queryKey: ["/api/responses", documentId, questionId, "counts"],
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (response: "yes" | "no") => {
      const sessionId = sessionStorage.getItem("sessionId") || crypto.randomUUID();
      sessionStorage.setItem("sessionId", sessionId);
      
      const res = await apiRequest("POST", "/api/responses", {
        documentId,
        questionId,
        response,
        sessionId,
      });
      return res.json();
    },
    onSuccess: (data, response) => {
      setUserResponse(response);
      queryClient.invalidateQueries({ 
        queryKey: ["/api/responses", documentId, questionId, "counts"] 
      });
      
      toast({
        title: "Response recorded",
        description: `Your ${response} response has been saved.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResponse = (response: "yes" | "no") => {
    submitResponseMutation.mutate(response);
  };

  const totalResponses = counts ? counts.yes + counts.no : 0;

  return (
    <div 
      className="yesno-question-component"
      data-testid={`yesno-question-${questionId}`}
    >
      <p className="font-medium mb-4" data-testid={`question-text-${questionId}`}>
        {question}
      </p>
      
      <div className="flex space-x-3 mb-3">
        <Button
          onClick={() => handleResponse("yes")}
          disabled={submitResponseMutation.isPending || userResponse !== null}
          className="bg-primary hover:bg-primary/80 text-primary-foreground"
          data-testid={`button-yes-${questionId}`}
        >
          <Check className="w-4 h-4 mr-2" />
          Yes
          {counts && (
            <span className="ml-2 bg-primary-foreground/20 px-2 py-0.5 rounded text-xs">
              {counts.yes}
            </span>
          )}
        </Button>
        
        <Button
          onClick={() => handleResponse("no")}
          disabled={submitResponseMutation.isPending || userResponse !== null}
          variant="destructive"
          data-testid={`button-no-${questionId}`}
        >
          <X className="w-4 h-4 mr-2" />
          No
          {counts && (
            <span className="ml-2 bg-destructive-foreground/20 px-2 py-0.5 rounded text-xs">
              {counts.no}
            </span>
          )}
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          <span data-testid={`loading-${questionId}`}>Loading responses...</span>
        ) : (
          <span data-testid={`response-count-${questionId}`}>
            {totalResponses} responses so far
          </span>
        )}
        
        {userResponse && (
          <span className="ml-2 text-primary" data-testid={`user-response-${questionId}`}>
            · You answered: {userResponse}
          </span>
        )}
      </div>
    </div>
  );
}

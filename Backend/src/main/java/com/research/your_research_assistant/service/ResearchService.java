package com.research.your_research_assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.research.your_research_assistant.entity.GeminiResponse;
import com.research.your_research_assistant.entity.ResearchRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class ResearchService {

    @Value("${gemini.api.url}")
    private String geminiapiurl;

    @Value("${gemini.api.key}")
    private String geminiapikey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public ResearchService(WebClient.Builder webClientBuilder,ObjectMapper objectMapper){
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    public String processRequestContent(ResearchRequest request) {

        //Buid Prompt
        //we'll write prompt logic here itself
        StringBuilder prompt = new StringBuilder();
        String operation = request.getOperation();
        switch(operation){
            case "summarize":
                prompt.append("provide a clear and concise summary in few lines in bullets points  of the selected texts");
                break;
            case "mindmap":
                prompt.append("Convert the following text into a simple hierarchical structure suitable for a Mermaid mind map syntax and dont't show ``` this before mermaid texts. Use only keywords and short phrases ");
                break;
            default:
                throw new IllegalArgumentException("Unknown "+request.getOperation());
        }
        prompt.append(request.getContent());
        String promptString = prompt.toString();

        //Query Gemini AI api
        Map<String,Object> requestBody = Map.of( "contents" , new Object[]{
                    Map.of("parts" , new Object[]{
                            Map.of("text" , promptString)
                    })
                });
        String response = webClient.post()
                .uri(geminiapiurl+geminiapikey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        //parse the response and then we will return it
        return extractTextFromReponse(response);
    }
    private String extractTextFromReponse(String response) {
        try {
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            if (geminiResponse.getCandidates() != null && !geminiResponse.getCandidates().isEmpty()) {
                GeminiResponse.Candidate firstCandidata = geminiResponse.getCandidates().get(0);
                if (firstCandidata.getContent() != null && firstCandidata.getContent().getParts() != null && !firstCandidata.getContent().getParts().isEmpty()) {
                    return firstCandidata.getContent().getParts().get(0).getText();
                }
            }
        }
        catch(Exception e){
            return "Error Parsing: " + e.getMessage();
        }
        return "No content found ";
    }

}



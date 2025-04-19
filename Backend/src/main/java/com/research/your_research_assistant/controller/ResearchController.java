package com.research.your_research_assistant.controller;

import com.research.your_research_assistant.entity.ResearchRequest;
import com.research.your_research_assistant.service.ResearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*")
public class ResearchController {
    @Autowired
    ResearchService researchService;

    @PostMapping("/process")
    public ResponseEntity<String> processRequestContent(@RequestBody ResearchRequest request){
        String result = researchService.processRequestContent(request);
        return ResponseEntity.ok(result);
    }
}

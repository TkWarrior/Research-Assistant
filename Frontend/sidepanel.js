document.addEventListener('DOMContentLoaded' ,() => {
    chrome.storage.local.get(["researchNotes"],function(result){
        if(result.researchNotes){
            document.getElementById("notes").value = result.researchNotes;
        }
    });
    document.getElementById("summarizebtn").addEventListener("click", summarizeText);
    document.getElementById("mindmapbtn").addEventListener("click" , generateMindmap);
    document.getElementById("saveNotesBtn").addEventListener("click", saveNotes);
    if (window.mermaid) {
      mermaid.initialize({ startOnLoad: false });
    }
});

async function summarizeText(){
    try {
        //this will capture the selected text area
        const [tab] = await chrome.tabs.query({active:true,currentWindow:true})
        const [ {result}] = await chrome.scripting.executeScript({
            target:{tabId: tab.id},
            function: () => window.getSelection().toString()
        });
       
        //if the user didn't select the text it will give the below result
        if(!result){
            showResult('Please select some text first',false)
            return;
        }

        //this will capture the response from backend which is quering with ai model api 
        const response = await fetch(
          "http://localhost:8080/api/research/process",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: result, operation: "summarize" }),
          }
        );
        
        if(!response.ok){
            throw new Error(`API Error: ${response.status}`)
        }
        const text = await response.text();
        showResult(text.replace(/\n/g,`<br>`));
    } catch (error) {
        showResult("Error :"+error.message,false)
    }
}

async function generateMindmap() {
    try {
      //this will capture the selected text area
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString(),
      });

      //if the user didn't select the text it will give the below result
      if (!result) {
        showMindmap("Please select some text first", false);
        return;
      }

      //this will capture the response from backend which is quering with ai model api
      const response = await fetch(
        "http://localhost:8080/api/research/process",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: result, operation: "mindmap" }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.text();
      showMindmap(data);
    } catch (error) {
      showMindmap("Error :" + error.message, false);
    }
}

async function saveNotes(){
    const notes = document.getElementById('notes').value
    chrome.storage.local.set({'researchNotes':notes},function(){
        alert('notes saved successfully')
    })
}

function showResult(content,useTypewriter = true){
    const resultContainer = document.getElementById("results");
    resultContainer.innerHTML = "";
    if(useTypewriter){
        let i = 0;
        function type() {
            if(i < content.length) {
                if(content[i]==="<" && content.substring(i,i+4)==="<br>"){
                    resultContainer.innerHTML += "<br>";
                    i+=4;
                }
                else{
                    resultContainer.innerHTML += content[i]; // yeh one letter at a time type karega
                    i++;
                }
               
                setTimeout(type,5);
            }
        }
        type();
    }
    else{
         document.getElementById(
           "results"
         ).innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
    }
}
function showMindmap(diagramtext){
    const mindmapContainer = document.getElementById("mindmap");
    mindmapContainer.innerHTML = "";

    const graphDiv = document.createElement("div");
    graphDiv.className = "mermaid";
    graphDiv.innerText = diagramtext;
    mindmapContainer.appendChild(graphDiv);
    
    if (window.mermaid && typeof mermaid.run === "function") {
      mermaid.run();
    } else {
      console.error("❌ Mermaid isn't loaded or initialized.");
    }
    
}
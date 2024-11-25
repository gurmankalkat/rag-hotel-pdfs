import os
from dotenv import load_dotenv
from langchain_openai.chat_models import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import DocArrayInMemorySearch
from operator import itemgetter
import sys
import json

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_KEY")
MODEL = "gpt-4o"

def calculate_totals(size, pdf_name):
    
    if MODEL.startswith("gpt"):
        model = ChatOpenAI(api_key=OPENAI_API_KEY, model=MODEL)
        embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)

    parser = StrOutputParser()

    chain = model | parser

    loader = PyPDFLoader(pdf_name)
    pages = loader.load_and_split()

    template = """
    Answer the question based on the context below..

    Context: {context}

    Question: {question}
    """
    prompt = PromptTemplate.from_template(template)

    chain = prompt | model | parser
    chain.input_schema.model_json_schema()

    vectorstore = DocArrayInMemorySearch.from_documents(pages, embedding=embeddings)
    retriever = vectorstore.as_retriever()
    retriever.invoke("costs OR price OR fees OR taxes OR discounts")

    chain = (
        {
            "context": itemgetter("question") | retriever,
            "question": itemgetter("question"),
        }
        | prompt
        | model
        | parser
    )

    questions = [
        "What is the total quote? This value may need to be be calculated using the number of days there, number of people, nightly rates, meeting room rates, food/beverage costs, parking, taxes, etc. Format your response as follows (try to make final total a single value and not an equation): 'Explanation: [detailed explanation]. Final Total: [final numerical value]'.",
        "What is the meeting room total? This value may need to be be calculated using the number of days there, number of people, meeting room rates, food/beverage costs, taxes, etc. Format your response as follows (try to make final total a single value and not an equation): 'Explanation: [detailed explanation]. Final Total: [final numerical value]'.",
        "What is the sleeping room total? This value may need to be be calculated using the number of days there, number of people, room types, etc. Format your response as follows (try to make final total a single value and not an equation): 'Explanation: [detailed explanation]. Final Total: [final numerical value]'.",
    ]

    explanations = []
    final_totals = []
    
    for question in questions:
        response = chain.invoke({'question': question})

        if "Explanation:" in response and "Final Total:" in response:
            explanation = response.split("Final Total:")[0].replace("Explanation:", "").strip()
            final_total = response.split("Final Total:")[-1].strip()

            explanations.append(explanation)
            final_totals.append(final_total)

    return {
        "explanations": explanations,
        "final_totals": final_totals,
    }


if __name__ == "__main__":
    # Get arguments from the command line
    pdf_name = sys.argv[1]
    size = int(sys.argv[2])  # Example: File size or other input metric

    # Process the data
    result = calculate_totals(size, pdf_name)

    # Output the result as a JSON string
    print(json.dumps(result, indent=2))
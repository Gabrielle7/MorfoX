# Portal-Morfox
Projeto desenvolvido para meio acadêmico, como resultado de projeto de Extensão do departamento de Ciência da Computação da UTFPR.

Este portal é uma ferramenta web para análise morfológica de textos em português.
A análise consta da frequência de etiquetas morfológicas, lemas, unigramas, bigramas e trigramas presentes no texto, assim como a listagem de tais elementos.
A etiquetagem e lematização são feitas com a biblioteca linguística Freeling, licenciada sob a Affero GPL.

A ferramenta utiliza de HTML5, CSS3 e JavaScript.
A tradução do código em C++ do Freeling para é feita por meio do Emscripten, um compilador LLVM-para-JavaScript distribuido sob a licença MIT.
A criação dos sliders é feita com a biblioteca nouislider (9.2.0).

Lista de arquivos:
nouislider.js - Código JS da biblioteca nouislider
nouislider.css - Folha de estilo do nouislider
wNumb.js - Código JS da biblioteca wNumb (usada pelo nouislider)

project.html - HTML do portal
portal.js - Funções em JS usadas no portal
layout.js - Folha de estilos do portal

emscripten.js - Funções JS do Emscripten e preparaçao do ambiente
project.data - Arquivos necessários ao código C++, carregados na compilação com o Emscripten
project.js - Resultado da tradução do código em C++ com o Emscripten
project.html.mem - Arquivos de inicialização, para otimização
UPDATE servicos SET categoria = 'INFRAESTRUTURA' WHERE nome IN ('Iluminação Pública', 'Infraestrutura');
UPDATE servicos SET categoria = 'OUTROS'          WHERE nome IN ('Coleta de Lixo', 'Limpeza Urbana', 'Outros');
UPDATE servicos SET categoria = 'SAUDE'           WHERE nome = 'Vazamento de Água';
# PostgreSQL portátil — Guia rápido

Este projeto inclui uma versão portátil do PostgreSQL em `postgresql/` para facilitar testes locais sem instalar um servidor PostgreSQL globalmente.

ATENÇÃO: O script realiza mudanças temporárias em `pg_hba.conf` para concluir o setup automaticamente. Essas mudanças facilitam a criação de usuário e banco local, mas reduzem a segurança se deixadas em `trust` em ambientes expostos.

1) Como executar o setup automático

Abra o PowerShell com permissão normal (ou administrador se preferir) e rode:

```powershell
cd "c:\Users\joel.souza\Downloads\NEW\erp-remotenyx"
.\setup_postgres_portable.bat
```

O script fará (resumo):
- Baixa/usa binários em `postgresql/bin` (se já existirem, usa-os)
- Inicializa o diretório `postgresql/data` (execução de `initdb`) se necessário
- Inicia o servidor com `pg_ctl` e escreve logs em `postgresql/logs/postgresql.log`
- Cria o usuário `erpadmin` e o banco `erpemotenyx` e define a senha `erpadmin2025`
- Cria/atualiza `./.env` com as credenciais e porta

2) Estado atual do setup (a configuração aplicada)

- Porta usada: 5432 (padrão)
- DB: `erpremotenyx`
- Usuário: `erpadmin`
- Senha: `erpadmin2025`
- Nota: `pg_hba.conf` pode ter sido temporariamente ajustado para `trust` nas entradas locais.

3) Comandos úteis

- Ver logs:

```powershell
Get-Content .\postgresql\logs\postgresql.log -Tail 200 -Wait
```

- Parar o servidor:

```powershell
cd "c:\Users\joel.souza\Downloads\NEW\erp-remotenyx\postgresql"
.\bin\pg_ctl.exe -D data stop
```

- Iniciar manualmente (se necessário):

```powershell
cd "c:\Users\joel.souza\Downloads\NEW\erp-remotenyx\postgresql"
.\bin\pg_ctl.exe -D data -l "logs\postgresql.log" start
```

- Testar disponibilidade:

```powershell
cd "c:\Users\joel.souza\Downloads\NEW\erp-remotenyx\postgresql"
.\bin\pg_isready.exe -h localhost -p 5432 -U erpadmin
```

- Conectar com `psql` (uso temporário de variável PGPASSWORD):

```powershell
$env:PGPASSWORD='erpadmin2025'
.\bin\psql.exe -h localhost -p 5432 -U erpadmin -d erpremotenyx
```

4) Recomendação de segurança (após setup)

1. Restaurar `pg_hba.conf` para `md5` ou `scram-sha-256` nas linhas locais em `postgresql/data/pg_hba.conf`.
2. Recarregar configurações do Postgres:

```powershell
cd "c:\Users\joel.souza\Downloads\NEW\erp-remotenyx\postgresql"
.\bin\pg_ctl.exe -D data reload
```

3. Verificar que conexões locais exigem senha:

```powershell
.\bin\psql.exe -h localhost -p 5432 -U erpadmin -d erpremotenyx -c "SELECT usename, usesuper FROM pg_user;"
```

5) Observações finais

- Os arquivos `setup_postgres_portable.bat` e `PostgreSQLManager.js` tentam automatizar o processo; o script agora lida com o caso onde os binários existem mas o diretório de dados não.
- Se você preferir usar um PostgreSQL global (instalado via instalador), atualize `./.env` com as credenciais da sua instância e reinicie a aplicação:

```powershell
node .\start.js
```

Se quiser, eu revertendo `pg_hba.conf` agora para `md5` e recarrego o servidor — deseja que eu faça isso agora? (responda `sim` ou `não`)

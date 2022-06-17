CREATE DATABASE progettopa;
\c progettopa
CREATE TABLE utenti(
    codice_fiscale CHAR(16) PRIMARY KEY,
    email_address VARCHAR(50) UNIQUE NOT NULL,
    numero_token INT NOT NULL,
    challenging_string CHAR(32) NOT NULL,
    challenging_code_one INT DEFAULT NULL,
    challenging_code_two INT DEFAULT NULL,
    expiration TIMESTAMP DEFAULT NULL
);

CREATE TABLE documenti(
    id SERIAL PRIMARY KEY,
    codice_fiscale_richiedente CHAR(16) NOT NULL,
    uri_firmato VARCHAR(100),
    uri_non_firmato VARCHAR(100) NOT NULL,
    numero_firmatari INT NOT NULL,
    nome_documento VARCHAR(50) NOT NULL, 
    hash_documento VARCHAR(256) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    stato_firma BOOL NOT NULL,
    FOREIGN KEY (codice_fiscale_richiedente) REFERENCES utenti(codice_fiscale)
);

CREATE TABLE processifirma(
    codice_fiscale_firmatario CHAR(16),
    id_documento INT,
    stato BOOL NOT NULL,
    PRIMARY KEY (codice_fiscale_firmatario,ID_documento),
    FOREIGN KEY (codice_fiscale_firmatario) REFERENCES utenti(codice_fiscale),
    FOREIGN KEY (ID_documento) REFERENCES Documenti(ID)
);
INSERT INTO utenti (codice_fiscale, email_address, numero_token, challenging_string) VALUES ('MNCDRN82T30D542U', 'demo@mailinator.com','100', 'abcdefghijklmnopqrstuvwxyzABCDEF');
INSERT INTO utenti (codice_fiscale, email_address, numero_token, challenging_string) VALUES ('LSPDRN94T30D542U', 'demo1@mailinator.com','100', 'aZcEeBghijKlmNopQrstuVwAyzabbccd');
INSERT INTO utenti (codice_fiscale, email_address, numero_token, challenging_string) VALUES ('TSNLNZ99E06E690J', 'demo2@mailinator.com','10', 'ZZdEFgHHIjLkOOPqRaSgUVabcZZbcdEF');
INSERT INTO utenti (codice_fiscale, email_address, numero_token, challenging_string) VALUES ('GHELFN85G56A271E', 'demo3@mailinator.com','1', 'UiOsGGhifcKlMnODxxAzeRkvbZssDEVF');
INSERT INTO utenti (codice_fiscale, email_address, numero_token, challenging_string) VALUES ('EFGLOR66T67A341E', 'demo4@mailinator.com','20', 'AFcDevvSlKJJznBQwRtGGHzDSQalhfmt');
,
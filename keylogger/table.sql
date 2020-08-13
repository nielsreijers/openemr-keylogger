CREATE TABLE IF NOT EXISTS aa_keylogger_trace (
  id          bigint(20)   NOT NULL auto_increment,
  user        varchar(255),
  time        bigint,
  type        varchar(32),
  data        varchar(255),
  x           int,
  y           int,
 PRIMARY KEY (id)
) ENGINE=InnoDB;

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# load environment variable from .env
load_dotenv()

# get database URL from environment
# gives access to the variables from .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./momentum.db")

#Create the database engine
# allows SQLalchemy to send SQL commands and retrieve the results from the DB
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Create base class for models
Base = declarative_base()
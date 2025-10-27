FROM python:3.9-slim

WORKDIR /app

COPY requirements-txt.txt .
RUN pip install --default-timeout=100 --no-cache-dir -r requirements-txt.txt

RUN echo "somepass" > text.txt
RUN rm text.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

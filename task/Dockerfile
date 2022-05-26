FROM alpine:3.16

ENV HOME=/home/uploader
WORKDIR $HOME

RUN apk add python3 py3-pip

COPY ./ $HOME/task
WORKDIR $HOME/task

RUN pip install -r requirements.txt

CMD python task.py


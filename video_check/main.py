import os
import cv2
from moviepy import *
from pathlib import Path
from collections import deque
from threading import Thread


def write_video(out, arr) -> None:
    for frame in arr:
        out.write(frame)


def read_video(cap, frame_queue):
    frame_counter = 0
    frame_array = []
    while True:
        try:
            ret, frame = cap.read()
            if not ret:
                break

            frame_array.append(frame)

            if len(frame_array) >= 100:
                frame_queue.append(frame_array)
            frame_counter += 1
            if frame_counter % 100 == 0:
                print(frame_counter)
        except Exception as e:
            print(e)



def process_video(v_file: Path) -> None:

    print('Processing video', v_file.stem)

    output_dir = v_file.parent.parent.joinpath("output")
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir.joinpath(v_file.stem + "_conv" + ".mp4")

    cap = cv2.VideoCapture(v_file.as_posix())

    if not cap.isOpened():
        raise IOError("Cannot open video file")

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    # fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output.as_posix(), fourcc, fps, (width, height))

    if not out.isOpened():
        raise IOError("Cannot open video out file")

    frame_queue = deque()

    # thread_read_video = Thread(target=read_video, args=(cap, frame_queue))
    # thread_read_video.start()
    #
    # while True:
    #     if thread_read_video.is_alive() or len(frame_queue) > 0:
    #         if len(frame_queue) > 0:
    #             print(len(frame_queue))
    #             write_video(out, frame_queue.popleft())
    #     else:
    #         break

    frame_counter = 0
    frame_array = []

    while True:
        try:
            ret, frame = cap.read()
            if not ret:
                break

            out.write(frame)

            frame_counter += 1
            if frame_counter % 100 == 0:
                print(frame_counter)
        except Exception as e:
            print(e)

    cap.release()
    out.release()

    video_track = VideoFileClip(output.as_posix())
    audio_track = AudioFileClip(v_file.as_posix())
    output_clip = v_file.parent.parent.joinpath("output").joinpath(v_file.stem + "_clip.mp4")

    full_clip = video_track.with_audio(audio_track)

    full_clip.write_videofile(output_clip.as_posix(),
                              codec="libx264",
                              bitrate="100000k",
                              audio_codec="aac",
                              audio_bitrate="320k",
                              audio_fps=48000)

    video_track.close()
    audio_track.close()

    os.remove(output.as_posix())

    print("Done processing video", v_file.stem, "\n\n\n")


def main():
    video_dir = Path(Path.cwd() / "input")
    video_dir.mkdir(parents=True, exist_ok=True)
    for video in video_dir.iterdir():
        pvideo = Thread(target=process_video, args=(video,))
        pvideo.start()
        pvideo.join()



if __name__ == '__main__':
    main()

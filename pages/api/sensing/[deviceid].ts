// 서버 함수임!!!
// 미리 데이터 받을 형식 갖춘 다음에 서버 만들어야 함

import { Device } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { json } from "stream/consumers";
import client from "../../../libs/server/client";

interface Data {
  ok: boolean;
  value?: number;
  error?: String;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Data>
) {
  if (request.method !== "GET" && request.method !== "POST") {
    return response.status(405).json({
      ok: false,
      error: `지원하지 않는 메서드 입니다 : ${request.method}`,
    });
  }
  const { deviceid } = request.query;
  if (!deviceid) {
    return response.status(200).json({
      ok: false,
      error: `장치 ID(deviceid)를 입력 해주세요`,
    });
  }

  try {
    switch (request.method) {
      case "GET":
        const result = await client.sencing.findFirst({
          where: {
            // 필터링
            deviceId: deviceid.toString(),
          },
          select: {
            // select는 필드를 선택할수 있음
            value: true, // 선택된 필드만 가져오려면 boolean
            id: false,
            updateAt: false,
          },
          orderBy: {
            // 정렬
            createAt: "desc", // createAt 기준으로 오름차순으로 정렬
          },
        });
        response.status(200).json({ ok: true, value: result?.value });
        break;
      case "POST":
        const obj = JSON.parse(request.body);
        if (true === isNaN(obj.value.toString())) {
          // 숫자가 아니면 에러 처리
          return response
            .status(500)
            .json({ ok: false, error: "숫자를 입력 해주세요" });
        }

        const value = Number(obj.value);

        await client.sencing.create({
          data: { value: value, deviceId: deviceid.toString() },
        });

        // 등록성공

        response.status(200).json({ ok: true });
        break;
    }
  } catch (err) {
    response.status(200).json({ ok: false, error: `큰일남 - ${err}` });
  } finally {
    // 예외가 있던 없던 실행되는 블럭
    await client.$disconnect();
  }
}


//     const { deviceid } = request.query;

//     // console.log("센싱값 가져올 장치 ID : " + deviceid);

//     const sensing = await client.sencing.findFirst({
//       where: {
//         deviceId: deviceid?.toString(),
//       },
//       orderBy: {
//         createAt: "desc",
//       },
//     });

//     response.status(200).json({ ok: true, value: sensing?.value });
//   } catch (err) {
//     response.status(200).json({ ok: false, error: `${err}` });
//   } finally {
//     //예외가 있던 없던 실행되는 블록임!
//     await client.$disconnect();
//   }
// }

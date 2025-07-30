using UnityEngine;
using UnityEngine.EventSystems;

public class CameraZoomController : MonoBehaviour
{
    public Camera mainCamera;
    public float zoomSpeed = 0.5f;
    public float moveSpeed = 0.3f;
    public float moveStep = 0.2f; // �� ���� �̵��ϴ� �Ÿ�
    public float rotateSpeed = 10f;
    public float targetZoomFOV = 10f; // ���� FOV
    public float defaultZoomFOV = 60f; // �ܾƿ� FOV
    public Vector3 defaultPosition;
    public Quaternion defaultRotation;

    public Vector3 fanPosition;
    public Quaternion fanRotation;
    public Vector3 sensorPosition;
    public Quaternion sensorRotation;
    public Vector3 waterPosition;
    public Quaternion waterRotation;

    private bool isZooming = false;
    private Vector3 targetPosition;
    private float targetFOV;

    private bool isRotating = false;
    private Quaternion targetRotation;

    void Start()
    {
        defaultPosition = mainCamera.transform.position;
        defaultRotation = mainCamera.transform.rotation;
        targetFOV = defaultZoomFOV;
        targetPosition = defaultPosition;
        targetRotation = defaultRotation;

        fanPosition = new Vector3(-0.38f, 2.23f, -28.75f);
        fanRotation = Quaternion.Euler(0, 160, 0);
        sensorPosition = new Vector3(-0.3f, 0.35f, -27.45f);
        sensorRotation = Quaternion.Euler(0, 0, 0);
        waterPosition = new Vector3(-1.73f, 0.9f, -27.78f);
        waterRotation = Quaternion.Euler(9.132f, 90, 0);
    }

    void Update()
    {
        if (Input.GetMouseButtonDown(0)) // ���콺 Ŭ��
        {
            // UI �� Ŭ���ߴ��� Ȯ��
            if (EventSystem.current.IsPointerOverGameObject())
            {
                // UI Ŭ�� ���̹Ƿ� ������Ʈ Ŭ�� ����
                return;
            }

            Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit))
            {
                ZoomToObject(hit.transform);
                Debug.Log("������Ʈ Ŭ��: " + hit.collider.name);
            }
        }

        // ��ġ �̵�
        if (isZooming)
        {
            mainCamera.transform.position = Vector3.Lerp(mainCamera.transform.position, targetPosition, Time.deltaTime * moveSpeed);
            mainCamera.fieldOfView = Mathf.Lerp(mainCamera.fieldOfView, targetFOV, Time.deltaTime * zoomSpeed);

            if (Vector3.Distance(mainCamera.transform.position, targetPosition) < 0.1f &&
                Mathf.Abs(mainCamera.fieldOfView - targetFOV) < 0.5f)
            {
                isZooming = false;
            }
        }

        // ȸ��
        if (isRotating)
        {
            mainCamera.transform.rotation = Quaternion.Lerp(mainCamera.transform.rotation, targetRotation, Time.deltaTime * rotateSpeed);
            if (Quaternion.Angle(mainCamera.transform.rotation, targetRotation) < 0.1f)
            {
                isRotating = false;
            }
        }
    }

    public void ZoomToObject(Transform target)
    {
        Vector3 dir = (mainCamera.transform.position - target.position).normalized;
        targetPosition = target.position + dir * 2f; // ������Ʈ���� �ణ ������ �Ÿ��� �̵�
        targetFOV = targetZoomFOV;
        isZooming = true;
    }

    public void ResetView()
    {
        targetPosition = defaultPosition;
        targetRotation = defaultRotation;
        targetFOV = defaultZoomFOV;
        isZooming = true;
        isRotating = true;
    }

    public void FanView()
    {
        targetPosition = fanPosition;
        targetRotation = fanRotation;
        targetFOV = targetZoomFOV;
        isZooming = true;
        isRotating = true;
    }

    public void SensorView()
    {
        targetPosition = sensorPosition;
        targetRotation = sensorRotation;
        targetFOV = targetZoomFOV;
        isZooming = true;
        isRotating = true;
    }

    public void WaterView()
    {
        targetPosition = waterPosition;
        targetRotation = waterRotation;
        targetFOV = targetZoomFOV;
        isZooming = true;
        isRotating = true;
    }

    // ī�޶� �̵� �Լ�
    public void MoveForward()
    {
        targetPosition += mainCamera.transform.forward * moveStep;
        isZooming = true;
    }

    public void MoveBackward()
    {
        targetPosition -= mainCamera.transform.forward * moveStep;
        isZooming = true;
    }

    public void MoveLeft()
    {
        targetPosition -= mainCamera.transform.right * moveStep;
        isZooming = true;
    }

    public void MoveRight()
    {
        targetPosition += mainCamera.transform.right * moveStep;
        isZooming = true;
    }

    public void MoveUp()
    {
        targetPosition += mainCamera.transform.up * moveStep;
        isZooming = true;
    }

    public void MoveDown()
    {
        targetPosition -= mainCamera.transform.up * moveStep;
        isZooming = true;
    }

    // ī�޶� ȸ�� �Լ�
    public void RotateLeft()
    {
        targetRotation = Quaternion.Euler(0, -15f, 0) * mainCamera.transform.rotation;
        isRotating = true;
    }

    public void RotateRight()
    {
        targetRotation = Quaternion.Euler(0, 15f, 0) * mainCamera.transform.rotation;
        isRotating = true;
    }

    public void RotateUp()
    {
        targetRotation = Quaternion.Euler(0, 0, 15f) * mainCamera.transform.rotation;
        isRotating = true;
    }

    public void RotateDown()
    {
        targetRotation = Quaternion.Euler(0, 0, -15f) * mainCamera.transform.rotation;
        isRotating = true;
    }
}

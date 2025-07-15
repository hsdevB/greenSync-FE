using UnityEngine;

public class CustomLODController : MonoBehaviour
{
    public GameObject LOD0;
    public GameObject LOD1;
    public GameObject LOD2;
    public GameObject LOD3;

    private Transform cam;

    void Start()
    {
        cam = Camera.main.transform;
    }

    void Update()
    {
        if (cam == null) return;

        Vector3 localDiff = transform.InverseTransformPoint(cam.position);
        float dx = Mathf.Abs(localDiff.x);
        float dz = Mathf.Abs(localDiff.z);

        if (dx <= 2f && dz <= 2f)
            SetLOD(0);
        else if (dx <= 4f && dz <= 4f)
            SetLOD(1);
        else if (dx <= 6f && dz <= 6f)
            SetLOD(2);
        else
            SetLOD(3);
    }

    void SetLOD(int level)
    {
        if (LOD0) LOD0.SetActive(level == 0);
        if (LOD1) LOD1.SetActive(level == 1);
        if (LOD2) LOD2.SetActive(level == 2);
        if (LOD3) LOD3.SetActive(level == 3);
    }
}
